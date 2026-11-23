"""Preenche o template da FIAP e gera entrega/PragFy-Prototipacao.docx.

Uso: coloque o template em entrega/template-original.docx, descompacte-o em entrega/tpl
(python -c "import zipfile; zipfile.ZipFile('entrega/template-original.docx').extractall('entrega/tpl')")
e rode python ferramentas/fill_template.py. Depois converta para PDF (LibreOffice ou Word)."""
import os, re, shutil, zipfile
from xml.sax.saxutils import escape

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
BASE = os.path.join(ROOT, 'entrega')
TPL = os.path.join(BASE, 'tpl')
PRINTS = os.path.join(ROOT, 'prints')
OUT = os.path.join(BASE, 'PragFy-Prototipacao.docx')
URL = 'https://tiny-squirrel-c134ec.netlify.app'

ONE_LINER = ('PragFy: a maioria dos brasileiros não tem sobra no fim do mês e muitos estão endividados. Com Open Finance e IA, '
             'o PragFy entende a situação real de cada pessoa, mostra onde dá para economizar e monta o plano da fase dela: '
             'sair das dívidas, criar uma reserva ou investir.')

INTRO = ('Protótipo de média fidelidade, pensado para o celular (mobile-first) e para a realidade brasileira, com dados e bancos '
         'fictícios. Para mostrar que o app atende qualquer situação, ele traz 3 perfis de exemplo, um em cada fase: '
         'Maria (renda de R$ 2.350, endividada no cartão e no cheque especial: fase 1, sair do vermelho), '
         'Ana (sem dívidas, mas sem sobra nem reserva: fase 2, criar um colchão) e Diego (com sobra: fase 3, investir). '
         'A IA analisa os gastos, sugere economias, monta o plano da fase e pede para o usuário classificar tudo o que chega '
         'sem categoria pelo Open Finance.')

SHOTS = [
    ('01-onboarding-problema', 'Onboarding: o problema', 'Começa pela realidade da maioria: o mês acaba antes do salário, com cartão, cheque especial e carnê.'),
    ('02-onboarding-fases', 'Onboarding: as fases', 'O app promete um plano para a fase de cada um: sair das dívidas, criar um colchão ou investir.'),
    ('03-consentimento', 'Open Finance', 'O usuário escolhe o que compartilhar, inclusive operações de crédito, que mostram as dívidas reais.'),
    ('04-maria-diag-dividas', 'Maria: dívidas encontradas', 'As dívidas chegam pelo Open Finance com os juros ao mês, e as caras (rotativo, cheque especial) ficam marcadas.'),
    ('05-maria-texto-livre', 'Maria: com as suas palavras', 'Ela conta que paga só o mínimo e às vezes aposta para tentar resolver tudo. A IA usa isso na interpretação.'),
    ('06-maria-leitura-ia', 'Maria: leitura da IA', 'Em tom acolhedor, a IA explica por que a dívida não diminui e diz claramente: agora não é hora de investir.'),
    ('07-maria-inicio', 'Maria: início', 'Notificação para classificar um Pix, resultado negativo do mês, a fase atual e os R$ 454 pagos só de juros.'),
    ('08-maria-classificar', 'A classificar', 'Tudo precisa de categoria. O que o Open Finance traz sem categoria vira pergunta, com a sugestão da IA e a opção de lembrar.'),
    ('09-maria-economias', 'Maria: onde foi o dinheiro', 'Gastos agrupados em essencial, dá para ajustar, custo do dinheiro (juros e tarifas), risco (apostas) e dívidas.'),
    ('10-maria-economias-cards', 'Maria: sugestões da IA', 'Cortes com valor, dificuldade e um botão para tentar. Apostas aparecem sem julgamento e com caminho de ajuda.'),
    ('11-maria-plano', 'Maria: plano de dívidas', 'Simulação mês a mês até zerar as dívidas, com o uso do 13º e a escolha da estratégia (maior juros ou menor dívida).'),
    ('12-maria-plano-passos', 'Maria: ordem e passos', 'A ordem de pagamento com a data em que cada dívida é quitada e os 3 passos: parar, renegociar e quitar.'),
    ('13-maria-negociar', 'Renegociar o cartão', 'Onde negociar, o que pedir, os direitos do consumidor, uma mensagem pronta para o banco e o alerta contra golpes.'),
    ('14-dividas-e-credito', 'Aprender: dívidas e crédito', 'Cada tipo de dívida explicado: juros típicos, quando faz sentido, regras e direitos. Ex.: o teto de juros do rotativo.'),
    ('15-maria-gastos', 'Maria: gastos', 'Transações do Open Finance com a categoria e o banco de origem, e o aviso das que faltam classificar.'),
    ('16-maria-analises', 'Maria: análises mensais', 'Todo mês a IA relê os dados e ajusta o plano, mostrando o que mudou e o que vai conferir no mês seguinte.'),
    ('17-ana-inicio', 'Ana: início', 'Sem dívidas, mas com sobra de só R$ 60: a fase é criar um colchão, e a IA achou R$ 210/mês de economia.'),
    ('18-ana-leitura-ia', 'Ana: leitura da IA', 'Reconhece o que já está bom (cartão em dia) e explica por que, sem reserva, qualquer imprevisto vira dívida.'),
    ('19-ana-economias', 'Ana: sugestões da IA', 'Ajustes que não mexem no essencial. O lazer não é cortado: a sugestão é combinar um teto.'),
    ('20-ana-plano-reserva', 'Ana: plano de reserva', 'Metas em degraus (R$ 500, 1 mês e 3 meses de gastos) com o prazo de cada uma, a partir do que dá para guardar.'),
    ('21-diego-carteira', 'Diego: carteira', 'Só na fase 3 o app mostra a carteira: a sobra dividida entre completar a reserva e investir.'),
    ('22-diego-carteira-classes', 'Diego: proporções', 'Só proporções por classe, os ajustes feitos pela IA e o aviso de que o PragFy não indica produtos.'),
    ('23-diego-fiis-opcoes', 'Aprender: FIIs', 'Cada opção da classe explicada em linguagem simples. Ex.: FII de desenvolvimento pode não pagar nada durante a obra.'),
    ('24-diego-fiis-ia', 'Pergunte à IA', 'Perguntas sugeridas e campo livre: a IA tira dúvidas sem recomendar produtos.'),
    ('25-conta-perfis', 'Conta e perfis', 'Contas conectadas pelo Open Finance e, só no protótipo, a troca entre os 3 perfis de exemplo.'),
]

NS_A = 'http://schemas.openxmlformats.org/drawingml/2006/main'
NS_PIC = 'http://schemas.openxmlformats.org/drawingml/2006/picture'

def run(text, size=22, bold=False, color=None, italic=False):
    rpr = '<w:rPr>' + ('<w:b/><w:bCs/>' if bold else '') + ('<w:i/>' if italic else '') + \
          (f'<w:color w:val="{color}"/>' if color else '') + f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/></w:rPr>'
    return f'<w:r>{rpr}<w:t xml:space="preserve">{escape(text)}</w:t></w:r>'

def para(inner, jc='both', after=120, before=0, first_line=0):
    return (f'<w:p><w:pPr><w:spacing w:before="{before}" w:after="{after}" w:line="276" w:lineRule="auto"/>'
            f'<w:ind w:firstLine="{first_line}"/><w:jc w:val="{jc}"/></w:pPr>{inner}</w:p>')

def image(rid, n, name, cx, cy):
    return (f'<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">'
            f'<wp:extent cx="{cx}" cy="{cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/>'
            f'<wp:docPr id="{n}" name="{escape(name)}"/>'
            f'<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="{NS_A}" noChangeAspect="1"/></wp:cNvGraphicFramePr>'
            f'<a:graphic xmlns:a="{NS_A}"><a:graphicData uri="{NS_PIC}"><pic:pic xmlns:pic="{NS_PIC}">'
            f'<pic:nvPicPr><pic:cNvPr id="{n}" name="{escape(name)}"/><pic:cNvPicPr/></pic:nvPicPr>'
            f'<pic:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
            f'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
            f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic>'
            f'</wp:inline></w:drawing></w:r>')

# ── Imagens: copia para word/media e cria relacionamentos ───────────────────
media = os.path.join(TPL, 'word', 'media')
os.makedirs(media, exist_ok=True)
rels_path = os.path.join(TPL, 'word', '_rels', 'document.xml.rels')
rels = open(rels_path, encoding='utf-8').read()
new_rels = []
for i, (fn, _, _) in enumerate(SHOTS, 1):
    shutil.copy(os.path.join(PRINTS, fn + '.png'), os.path.join(media, f'print{i:02d}.png'))
    new_rels.append(f'<Relationship Id="rIdPrint{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/print{i:02d}.png"/>')
new_rels.append(f'<Relationship Id="rIdLinkProto" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="{URL}" TargetMode="External"/>')
rels = rels.replace('</Relationships>', ''.join(new_rels) + '</Relationships>')
open(rels_path, 'w', encoding='utf-8').write(rels)

# ── Grade de prints: tabela 3 colunas sem bordas ────────────────────────────
COL = 3023                       # dxa (3 × 3023 = 9069 ≈ largura útil de 9071)
CX = 1404000                     # 3,9 cm (duas linhas de prints por página e uma na primeira)
CY = round(CX * 1688 / 780)      # mantém a proporção do print (390×844)

def cell(i, fn, title, comment):
    inner = (para(image(f'rIdPrint{i}', 100 + i, f'Print {i} - {title}', CX, CY), jc='center', after=60) +
             para(run(f'{i}. {title}', size=19, bold=True), jc='center', after=40) +
             para(run(comment, size=16, color='404040'), jc='center', after=200))
    return (f'<w:tc><w:tcPr><w:tcW w:w="{COL}" w:type="dxa"/></w:tcPr>{inner}</w:tc>')

def empty_cell():
    return f'<w:tc><w:tcPr><w:tcW w:w="{COL}" w:type="dxa"/></w:tcPr><w:p/></w:tc>'

rows = []
for r in range(0, len(SHOTS), 3):
    cells = [cell(r + k + 1, *SHOTS[r + k]) if r + k < len(SHOTS) else empty_cell() for k in range(3)]
    rows.append(f'<w:tr><w:trPr><w:cantSplit/></w:trPr>{"".join(cells)}</w:tr>')

nob = ''.join(f'<w:{s} w:val="nil"/>' for s in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'))
table = (f'<w:tbl><w:tblPr><w:tblW w:w="{COL * 3}" w:type="dxa"/><w:jc w:val="center"/>'
         f'<w:tblBorders>{nob}</w:tblBorders><w:tblLayout w:type="fixed"/>'
         f'<w:tblCellMar><w:left w:w="60" w:type="dxa"/><w:right w:w="60" w:type="dxa"/></w:tblCellMar></w:tblPr>'
         f'<w:tblGrid>{"".join(f"<w:gridCol w:w=\"{COL}\"/>" for _ in range(3))}</w:tblGrid>{"".join(rows)}</w:tbl>')

link_par = para(f'<w:hyperlink r:id="rIdLinkProto" w:history="1"><w:r><w:rPr><w:color w:val="0563C1"/><w:u w:val="single"/>'
                f'<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t>{URL}</w:t></w:r></w:hyperlink>', jc='left', after=120)
link_note = para(run('No computador, abre numa moldura de celular com a troca entre os 3 perfis; no celular, em tela cheia. '
                     'Tudo é clicável: classificar gastos, ligar economias, mudar a estratégia das dívidas e perguntar à IA.',
                     size=20, color='404040'), jc='both', after=120)
link_par = link_par.replace('<w:pPr>', '<w:pPr><w:keepNext/>', 1)

# ── Substitui os parágrafos vazios do template ──────────────────────────────
doc_path = os.path.join(TPL, 'word', 'document.xml')
doc = open(doc_path, encoding='utf-8').read()

def replace_para(doc, para_id, new_xml):
    pat = re.compile(r'<w:p [^>]*w14:paraId="' + para_id + r'"[^>]*>.*?</w:p>', re.S)
    assert len(pat.findall(doc)) == 1, para_id
    return pat.sub(lambda m: new_xml, doc)

doc = replace_para(doc, '295D5504', para(run(ONE_LINER, size=24), jc='both', after=120, before=60))
DISCLAIMER = para(run('O PragFy não indica produtos financeiros: mostra proporções, caminhos e explicações para o usuário decidir.', size=17, color='707070', italic=True), jc='left', after=200)
doc = replace_para(doc, '26AFE78D', para(run(INTRO, size=22), jc='both', after=80, before=60) + DISCLAIMER + table)
doc = replace_para(doc, '54614824', link_par + link_note)
# Título do item 3 não pode ficar sozinho no fim da página: prende ao parágrafo do link
pat3 = re.compile(r'(<w:p [^>]*w14:paraId="288D05EA"[^>]*><w:pPr><w:pStyle w:val="SubTtulo-AutoreVerso"/>)')
assert len(pat3.findall(doc)) == 1
doc = pat3.sub(lambda m: m.group(1) + '<w:keepNext/>', doc)
open(doc_path, 'w', encoding='utf-8').write(doc)

# ── Recompacta ──────────────────────────────────────────────────────────────
if os.path.exists(OUT): os.remove(OUT)
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
    for d, _, fs in os.walk(TPL):
        for f in fs:
            p = os.path.join(d, f)
            z.write(p, os.path.relpath(p, TPL).replace(os.sep, '/'))
print('ok', OUT, os.path.getsize(OUT))
