"""Validate a reviewed website archive and atomically activate a static release."""
import json
import os
from pathlib import Path
import re
import shutil
import sys
import tarfile
import tempfile

root = Path(__file__).resolve().parent.parent
releases = root / '.releases'
releases.mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(dir=releases) as work:
    stage = Path(work)
    with tarfile.open(sys.argv[1], 'r:gz') as archive:
        members = archive.getmembers()
        assert len(members) <= 10000 and sum(m.size for m in members) <= 100 * 1024 * 1024, 'Archive too large'
        for member in members:
            path = Path(member.name)
            assert not path.is_absolute() and '..' not in path.parts, 'Unsafe archive path'
            assert member.isfile() or member.isdir(), 'Links and special files are forbidden'
            assert path.parts[0] == 'site' or member.name == 'release.json', 'Unexpected archive entry'
        archive.extractall(stage, filter='data')
    metadata = json.loads((stage / 'release.json').read_text())
    assert metadata['schemaVersion'] == 1
    assert metadata['source'] == 'https://github.com/vegas0250/vui'
    assert re.fullmatch(r'[a-f0-9]{40}', metadata['commit'])
    assert re.fullmatch(r'\d+\.\d+\.\d+', metadata['version'])
    site = stage / 'site'
    assert 'theme-boot.js' in (site / 'index.html').read_text()
    release = releases / metadata['commit']
    assert not release.exists(), 'Release already exists; roll back by switching current explicitly'
    shutil.copytree(site, release)
    shutil.copy2(stage / 'release.json', release / 'release.json')
    for path in [release, *release.rglob('*')]:
        path.chmod(0o755 if path.is_dir() else 0o644)
    pending = root / '.current-next'
    pending.symlink_to(release.relative_to(root))
    os.replace(pending, root / 'current')
    print('Published https://vui.vegas0250.ru/ from ' + metadata['commit'])
