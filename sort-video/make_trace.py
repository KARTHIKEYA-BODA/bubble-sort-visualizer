import json

CODE = """v = [7, 4, 2, 1, 8, 3, 6, 5]
n = len(v)
for i in range(n - 1):
    ok = True
    for j in range(n - 1 - i):
        if v[j] > v[j+1]:
            v[j], v[j+1] = v[j+1], v[j]
            ok = False
    if ok:
        break
print(v)"""

v = [7, 4, 2, 1, 8, 3, 6, 5]
steps = []

def log(line, **extra):
    steps.append({"line": line, "arr": v[:], **extra})

log(1)
n = len(v)
log(2)
for i in range(n - 1):
    ok = True
    log(4)
    for j in range(n - 1 - i):
        log(5, compare=[j, j + 1])
        if v[j] > v[j + 1]:
            log(6, compare=[j, j + 1])
            v[j], v[j + 1] = v[j + 1], v[j]
            ok = False
            log(7, swap=[j, j + 1])
    if ok:
        log(8)
        log(9)
        break
log(10)

with open("src/trace.ts", "w") as f:
    f.write("export type Step = {line: number; arr: number[]; compare?: number[]; swap?: number[]};\n")
    f.write("export const steps: Step[] = " + json.dumps(steps) + ";\n")
    f.write("export const codeLines: string[] = " + json.dumps(CODE.split("\n")) + ";\n")

print("wrote src/trace.ts with", len(steps), "steps")