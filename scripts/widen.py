# Чернетка 16:9 для ролика шляху «Сайти»: копіює Scenes → ScenesWide, заголовок сцени (Box y≤330 з Big) → LHead зліва,
# решта сцени → <Fit from to> праворуч (сцена без заголовка → Fit center). Додає export SitesNNWide. Далі — ручна правка за кадрами.
# usage: python scripts/widen.py src/ideas/Sites07.tsx
import re, sys

p = sys.argv[1]
s = open(p, encoding='utf8').read()
if 'ScenesWide' in s:
    sys.exit(f'{p}: ScenesWide уже є')
name = re.search(r'export const (Sites\d\d): React\.FC', s).group(1)
a = s.index('const Scenes = (t: number) => {')
b = s.index('\n};\n', a) + 4
scenes = s[a:b]

HEAD = re.compile(r'^\t\t\t\t<Box y=\{(\d+)\}[^>]*><Big(?: size=\{(\d+)\})?(?: style=\{\{[^}]*\}\})?>(.*)</Big></Box>$')
YS = re.compile(r'\by=\{(\d+)\}|top: (\d+)')

def children(lines):
    out, cur = [], []
    for ln in lines:
        if re.match(r'^\t\t\t\t[<{]', ln) and cur:
            out.append(cur); cur = []
        cur.append(ln)
    if cur: out.append(cur)
    return out

def show(block):
    first, body, last = block[0], block[1:-1], block[-1]
    kids = children(body)
    head = None
    rest = []
    phrase = lambda k: len(k) == 1 and '<Big' in k[0] and k[0].lstrip('	').startswith('<Box')
    visual = any(not phrase(k) for k in kids)  # є щось, крім фраз, — тоді перший заголовок іде вліво
    for k in kids:
        m = HEAD.match(k[0]) if len(k) == 1 else None
        if head is None and visual and m and int(m.group(1)) <= 460:
            size = min(int(m.group(2) or 96), 92)
            head = f'\t\t\t\t<LHead size={{{size}}}>{m.group(3)}</LHead>'
        else:
            rest.append(k)
    flat = [ln for k in rest for ln in k]
    if any('<Title ' in ln for ln in flat):
        lo, hi = 420, 1100
    else:
        tops, bots = [], []
        for k in rest:  # свій компонент без y (Variants, Rates, CineHero…) малює себе приблизно в 420…1300
            if not YS.search(k[0]): tops.append(460); bots.append(1300)
        for ln in flat:
            for x, y in YS.findall(ln):
                v = int(x or y)
                if not 150 <= v <= 1700: continue
                h = re.search(r'(?:h|minH)=\{(\d+)\}', ln)
                tops.append(v); bots.append(v + (int(h.group(1)) + 40 if h else 180))
        lo = (min(tops) if tops else 420) - 40
        hi = (max(bots) if bots else 1250) + 40
    inner = ['\t' + ln for ln in flat]
    fit = [f'\t\t\t\t<Fit from={{{lo}}} to={{{hi}}}{"" if head else " center"}>'] + inner + ['\t\t\t\t</Fit>'] if flat else []
    return [first] + ([head] if head else []) + fit + [last]

lines = scenes.replace('const Scenes = ', 'const ScenesWide = ', 1).split('\n')
res, i = [], 0
while i < len(lines):
    if re.match(r'^\t\t\t<Show ', lines[i]):
        j = i
        while not re.match(r'^\t\t\t</Show>', lines[j]): j += 1
        res += show(lines[i:j + 1]); i = j + 1
    else:
        res.append(lines[i]); i += 1
wide = '\n'.join(res)

ea = s.index(f'export const {name}: React.FC')
eb = s.index('\n);\n', ea) + 4
exp = s[ea:eb]
wexp = (exp.replace(f'export const {name}: React.FC<{{theme?: string; seed?: number}}> = ({{theme, seed}})',
                    f'export const {name}Wide: React.FC<{{theme?: string; seed?: number; kicker?: React.ReactNode}}> = ({{theme, seed, kicker}})')
           .replace('<StepVideo ', '<StepVideo wide kicker={kicker} ', 1).replace('scenes={Scenes}', 'scenes={ScenesWide}'))
assert wexp != exp and 'Wide' in wexp, 'export не розпізнано'

s = s.rstrip('\n') + '\n\n// ---------- 16:9 (велике відео шляху): заголовок зліва, візуал справа ----------\n' + wide + '\n' + wexp
imp = re.search(r"import \{([^}]*)\} from '\.\./system/step';", s)
names = [n.strip() for n in imp.group(1).split(',')]
for n in ('Fit', 'LHead'):
    if n not in names: names.append(n)
s = s.replace(imp.group(0), "import {" + ', '.join(sorted(names, key=str.lower)) + "} from '../system/step';")
open(p, 'w', encoding='utf8', newline='\n').write(s)
print(p, name + 'Wide')
