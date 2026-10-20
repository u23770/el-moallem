#!/usr/bin/env python3
"""Helper: find a snapshot ref by button label regex and click it via playwright-cli."""
import re, subprocess, sys, glob

pattern = sys.argv[1]
subprocess.run(['playwright-cli', '-s=arena', 'snapshot'], capture_output=True)
files = sorted(glob.glob('.playwright-cli/page-*.yml'), key=lambda p: __import__('os').path.getmtime(p), reverse=True)
txt = open(files[0], encoding='utf-8').read()
m = re.search(r'button "[^"]*' + pattern + r'[^"]*"[^\n]*\[ref=([a-z0-9]+)\]', txt)
if not m:
    print('NOT FOUND:', pattern)
    sys.exit(1)
print('clicking', m.group(1), 'for', pattern)
r = subprocess.run(['playwright-cli', '-s=arena', 'click', m.group(1)], capture_output=True, text=True)
print(r.stdout[-300:] if r.stdout else '', r.stderr[-300:] if r.stderr else '')
