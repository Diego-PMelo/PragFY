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

ONE_LINER = ('PragFy: a maioria das famílias brasileiras está endividada e sem sobra no fim do mês, mas os apps de finanças '
             'partem de quem já tem dinheiro para investir. O PragFy conecta as contas pelo Open Finance, usa IA para entender '
             'a situação real de cada pessoa e monta o plano da fase em que ela está: sair das dívidas, criar uma reserva '
             'e, só depois, investir.')

# Item 2: texto antes dos prints. Cada seção: (título, [parágrafos]); parágrafo que começa com "• " vira item de lista.
SECOES = [
    ('O problema', [
        'Segundo a CNC (Peic, julho de 2026), 82% das famílias brasileiras têm dívidas, e o cartão de crédito aparece em 85% '
        'delas; entre as que ganham até 3 salários mínimos, 38,5% estão com contas em atraso. A Serasa contou 84,2 milhões de '
        'inadimplentes em setembro de 2026, mais da metade dos adultos. Para muitos, o salário acaba antes do mês: o cartão e o cheque especial cobrem a diferença, '
        'o rotativo cobra cerca de 13% ao mês e, pagando só o mínimo, a dívida não para de crescer. A maioria dos apps de '
        'finanças, porém, parte de quem já tem sobra e fala em investir com quem ainda paga mais de juros do que qualquer '
        'aplicação renderia.',
    ]),
    ('A solução', [
        '• Open Finance: saldos, gastos, receitas e as dívidas reais, com seus juros, entram automaticamente. Toda movimentação precisa '
        'de categoria; o que chega sem uma vira uma notificação para o usuário classificar, com a sugestão da IA.',
        '• IA: interpreta o diagnóstico e o relato que a pessoa escreve com as próprias palavras, analisa os gastos e mostra onde dá para '
        'economizar sem cortar o essencial. Todo mês relê os dados e refina o plano.',
        '• Plano por fase: na fase 1, sair do vermelho, o app diz claramente que não é hora de investir e simula a quitação mês '
        'a mês; na fase 2, criar um colchão, monta a reserva em metas; na fase 3, investir, mostra a proporção da carteira por classe.',
    ]),
    ('Objetivos do app', [
        '• Tirar a pessoa do vermelho: parar a dívida cara, renegociar e quitar na melhor ordem.',
        '• Dar clareza sobre o dinheiro: tudo categorizado e separado em essencial, ajustável, custo do dinheiro e risco.',
        '• Criar uma reserva para imprevistos antes de qualquer investimento, para a pessoa não voltar a se endividar.',
        '• Educar: explicar cada tipo de dívida e cada classe de investimento em linguagem simples, para a pessoa decidir sozinha.',
    ]),
    ('O protótipo', [
        'Média fidelidade, mobile-first, com dados e bancos fictícios. Três perfis mostram o app em cada fase: Maria (renda de '
        'R$ 2.350, rotativo e cheque especial: fase 1), Ana (sem dívidas, mas com sobra de R$ 60 e sem reserva: fase 2) e '
        'Diego (com sobra todo mês: fase 3).',
    ]),
]

SHOTS = [
    ('01-onboarding-problema', 'Onboarding: o problema', 'Abre pela dor da maioria: o salário que acaba antes do mês, coberto por cartão, carnê e cheque especial. Quem está no vermelho se reconhece no app.'),
    ('02-onboarding-fases', 'Onboarding: as fases', 'Apresenta a proposta: um plano para a fase de cada um. Sair das dívidas vem antes do colchão, e investir só entra depois, com sobra e reserva.'),
    ('03-consentimento', 'Open Finance', 'Consentimento no padrão do Open Finance: o usuário escolhe o que compartilhar e por quanto tempo. As operações de crédito revelam as dívidas e os juros.'),
    ('04-maria-diag-dividas', 'Maria: dívidas encontradas', 'As dívidas chegam pelo Open Finance com os juros ao mês; as caras (rotativo e cheque especial) ficam marcadas. Dá para somar as que o banco não mostra.'),
    ('05-maria-texto-livre', 'Maria: com as suas palavras', 'Campo livre para contar o que os números não mostram. Maria diz que paga só o mínimo e às vezes aposta para tentar sair das dívidas.'),
    ('06-maria-leitura-ia', 'Maria: leitura da IA', 'A IA cruza números e relato e explica, sem julgamento, por que a dívida não diminui. A conclusão é direta: agora não é hora de investir.'),
    ('07-maria-inicio', 'Maria: início', 'Faltaram R$ 173 no mês, cobertos pelo cheque especial, e R$ 454 foram só de juros. Mostra a fase, o próximo passo e um Pix para classificar.'),
    ('08-maria-classificar', 'A classificar', 'Toda receita e todo gasto precisam de categoria. O que chega sem categoria vira notificação, com a sugestão da IA e a opção de lembrar para as próximas.'),
    ('09-maria-economias', 'Maria: onde foi o dinheiro', 'Gastos separados em essencial (não é cortado), dá para ajustar, custo do dinheiro, risco (apostas) e dívidas. As mudanças escolhidas somam R$ 325/mês.'),
    ('10-maria-economias-cards', 'Maria: sugestões da IA', 'Cada sugestão traz valor atual, meta e dificuldade; o usuário escolhe o que tentar. Apostas vêm sem julgamento, com autoexclusão e apoio do SUS.'),
    ('11-maria-plano', 'Maria: plano de dívidas', 'Simulação mês a mês até zerar as dívidas, refeita com as economias escolhidas. Dá para usar o 13º e escolher: maior juros ou menor dívida primeiro.'),
    ('12-maria-plano-passos', 'Maria: ordem e passos', 'A ordem de pagamento com a data prevista de quitação de cada dívida, os 3 passos (parar, renegociar e quitar) e o que acontece pagando só o mínimo.'),
    ('13-maria-negociar', 'Renegociar o cartão', 'Guia prático: quanto cabe no bolso, onde negociar, o que pedir e perguntar, os direitos do consumidor, uma mensagem pronta e o alerta contra golpes.'),
    ('14-dividas-e-credito', 'Aprender: dívidas e crédito', 'Cada tipo de dívida em linguagem simples: juros típicos, como funciona, quando pode fazer sentido e as regras, como o teto de juros do rotativo.'),
    ('15-maria-gastos', 'Maria: gastos', 'Extrato único das contas conectadas, com a categoria e o banco de cada lançamento, os totais do mês e o aviso do que falta classificar.'),
    ('16-maria-analises', 'Maria: análises mensais', 'Todo mês a IA relê os dados, registra o que mudou e ajusta o plano. Também avisa o que vai conferir no mês seguinte, como os cortes e o 13º.'),
    ('17-ana-inicio', 'Ana: início', 'Sem dívidas, mas sobram só R$ 60 e não há reserva: fase 2, criar um colchão. A IA encontrou R$ 210/mês de economia sem mexer no essencial.'),
    ('18-ana-leitura-ia', 'Ana: leitura da IA', 'A IA reconhece o que já está bom (cartão em dia) e explica o risco: sem reserva, qualquer imprevisto vira dívida. A prioridade passa a ser o colchão.'),
    ('19-ana-economias', 'Ana: sugestões da IA', 'Ajustes realistas, como menos delivery e menos streamings. O lazer não é cortado: a sugestão é combinar um teto, para o plano caber na vida real.'),
    ('20-ana-plano-reserva', 'Ana: plano de reserva', 'Reserva em metas: R$ 500, 1 mês e 3 meses de gastos. O prazo de cada meta sai do que sobra somado às economias escolhidas.'),
    ('21-diego-carteira', 'Diego: carteira', 'Só na fase 3 o app monta a carteira. A sobra do mês é dividida entre completar a reserva de emergência e investir no longo prazo.'),
    ('22-diego-carteira-classes', 'Diego: proporções', 'A carteira mostra só a proporção por classe, a partir do perfil e dos objetivos, e explica cada ajuste feito pela IA. Nenhum produto é indicado.'),
    ('23-diego-fiis-opcoes', 'Aprender: FIIs', 'Cada classe traz suas opções explicadas: como rende, risco, liquidez e imposto. Ex.: um FII de desenvolvimento pode passar a obra sem pagar nada.'),
    ('24-diego-fiis-ia', 'Pergunte à IA', 'Perguntas sugeridas e campo livre para tirar dúvidas sobre a classe. A IA explica conceitos e riscos, mas não recomenda produtos.'),
    ('25-conta-perfis', 'Conta e perfis', 'Contas conectadas pelo Open Finance, com o prazo de cada consentimento. Só no protótipo, permite alternar entre os 3 perfis de exemplo.'),
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
CX = 1330000                     # 3,7 cm: duas linhas de prints por página
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
def bloco(paragrafos):
    xml = ''
    for t in paragrafos:
        if t.startswith('• '):
            xml += para(run('•  ' + t[2:], size=21), jc='both', after=60).replace('<w:ind w:firstLine="0"/>', '<w:ind w:left="284" w:hanging="200"/>')
        else:
            xml += para(run(t, size=21), jc='both', after=80)
    return xml

INTRO_XML = ''.join(para(run(titulo, size=22, bold=True), jc='left', after=40, before=120 if i else 60).replace('<w:pPr>', '<w:pPr><w:keepNext/>', 1) + bloco(ps)
                    for i, (titulo, ps) in enumerate(SECOES))
doc = replace_para(doc, '26AFE78D', INTRO_XML + DISCLAIMER + table)
doc = replace_para(doc, '54614824', link_par + link_note)
# Título do item 3 não pode ficar sozinho no fim da página: prende ao parágrafo do link
pat3 = re.compile(r'(<w:p [^>]*w14:paraId="288D05EA"[^>]*><w:pPr><w:pStyle w:val="SubTtulo-AutoreVerso"/>)')
assert len(pat3.findall(doc)) == 1
doc = pat3.sub(lambda m: m.group(1) + '<w:keepNext/>', doc)
open(doc_path, 'w', encoding='utf-8').write(doc)

# ── Cabeçalho: tira o título do template e o "Página N" das páginas seguintes ─
hdr_path = os.path.join(TPL, 'word', 'header1.xml')
hdr = open(hdr_path, encoding='utf-8').read()
hdr = re.sub(r'(<w:p [^>]*>)(.*?)(</w:pPr>).*?(</w:p>)', lambda m: m.group(1) + m.group(2) + m.group(3) + m.group(4), hdr, count=1, flags=re.S)
assert 'PAGE' not in hdr
open(hdr_path, 'w', encoding='utf-8').write(hdr)

# ── Título do arquivo (metadado do PDF) ─────────────────────────────────────
core_path = os.path.join(TPL, 'docProps', 'core.xml')
core = open(core_path, encoding='utf-8').read()
core = re.sub(r'<dc:title>.*?</dc:title>|<dc:title/>', '<dc:title>PragFy - Atividade de Prototipação</dc:title>', core)
open(core_path, 'w', encoding='utf-8').write(core)

# ── Recompacta ──────────────────────────────────────────────────────────────
if os.path.exists(OUT): os.remove(OUT)
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
    for d, _, fs in os.walk(TPL):
        for f in fs:
            p = os.path.join(d, f)
            z.write(p, os.path.relpath(p, TPL).replace(os.sep, '/'))
print('ok', OUT, os.path.getsize(OUT))
