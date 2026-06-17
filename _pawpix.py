#!/usr/bin/env python3
# Hand-drawn clean pixel cat paws for RPS (match IMG_8453): rock/scissors/paper.
import json
from PIL import Image
import numpy as np
C={'o':'#3b2a20','c':'#f7f2e6','C':'#e6ddca','b':'#e49aa1','B':'#cf828b','k':'#f2bdc1','.':None}

ROCK=[
"....oooooo....",
"...occcccco...",
"..occcccccco..",
".occcccccccco.",
".ocCccooccCco.",
".occcccccccco.",
".occcccccccco.",
".oCccccccccco.",
".occcccccccco.",
"..occcccccco..",
"..occcccccco..",
"..oCcccccccо..".replace('о','o'),
"..occcccccco..",
"..occcccccco..",
"...oCccccco...",
"...occcccco...",
"....oooooo....",
]
SCISS=[
"..o......o...",
".okо....okо..".replace('о','o'),
".okc....okc..",
".okc....okc..",
".occ....occ..",
".occ....occ..",
".occo..occc..",
"..occccccc...",
".occcccccco..",
".occcccccco..",
".occcccccco..",
"..occcccccо..".replace('о','o'),
"..oCcccccco..",
"..occcccccо..".replace('о','o'),
"...occcccо...".replace('о','o'),
"...occcccо...".replace('о','o'),
"....ooooo....",
]
PAPER=[
"...o.o.o.o...",
"..okоokоokо..".replace('о','o'),
".okcokcokcko.",
".occccccccco.",
".occcccccccо.".replace('о','o'),
".occcBBBccco.",
".occcBBBBcco.",
".occBBBBBcco.",
".occcBBBBcco.",
".occccBBccco.",
"..occcccccо..".replace('о','o'),
"..occccccccо..".replace('о','o')[:13],
"..oCccccccо..".replace('о','o'),
"..occccccccо..".replace('о','o')[:13],
"...oCcccco...",
"...occcccо...".replace('о','o'),
"....ooooo....",
]
def norm(g):
    w=max(len(r) for r in g); return [r.ljust(w,'.') for r in g]
def emit(g):
    g=norm(g); H=len(g); W=len(g[0]); runs=[]
    for y in range(H):
        x=0
        while x<W:
            ch=g[y][x]
            if ch=='.' or ch not in C or C[ch] is None: x+=1; continue
            x0=x
            while x<W and g[y][x]==ch: x+=1
            runs.append('<rect x="%d" y="%d" width="%d" height="1" fill="%s"/>'%(x0,y,x-x0,C[ch]))
    return W,H,'<svg viewBox="0 0 %d %d" style="width:100%%;height:100%%;shape-rendering:crispEdges">%s</svg>'%(W,H,''.join(runs))
out={}
prev=Image.new('RGB',(3*150,180),(60,50,80))
for i,(nm,g) in enumerate([('rock',ROCK),('scissors',SCISS),('paper',PAPER)]):
    W,H,svg=emit(g); out[nm]=svg
    sc=8; im=Image.new('RGBA',(W*sc,H*sc),(0,0,0,0)); pa=np.array(im)
    gg=norm(g)
    for y in range(H):
        for x in range(W):
            ch=gg[y][x]
            if ch in C and C[ch]:
                col=tuple(int(C[ch].lstrip('#')[k:k+2],16) for k in (0,2,4)); pa[y*sc:(y+1)*sc,x*sc:(x+1)*sc]=(*col,255)
    cell=Image.fromarray(pa,'RGBA')
    prev.paste(Image.new('RGB',(150,180),(60,50,80)),(i*150,0))
    prev.paste(cell.convert('RGB'),(i*150+10,10),cell)
json.dump(out,open('/tmp/pawpix.json','w'))
prev.save('/tmp/pawpix_prev.png'); print('done',{k:len(v) for k,v in out.items()})
