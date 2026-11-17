# Converte a Planilha_de_Equipamentos.xlsx em arquivo de importação do F2 Media Equipamentos.
# A curadoria abaixo foi feita lendo cada aba; números de série vêm da planilha.
import json, re, sys, hashlib

items = []
REVISAR = 'Nº de série a conferir (na planilha estava "?")'

def sn(v):
    if v is None: return ''
    if isinstance(v, float):
        v = str(int(v)) if v.is_integer() else str(v)
    v = str(v).strip()
    return '' if v in ('?', '') else v

def add(nome, cat, serie='', marca='', modelo='', acess='', obs='', qtd=1, status='disponivel', origem=''):
    raw = serie
    s = sn(serie)
    notes = [obs] if obs else []
    if isinstance(raw, str) and raw.strip() == '?':
        notes.append(REVISAR)
    elif isinstance(raw, str) and '?' in raw:
        notes.append('Nº de série com caracteres ilegíveis na planilha — conferir')
    items.append(dict(nome=nome.strip(), categoria=cat, serie=s, marca=marca, modelo=modelo,
                      acessorios=acess, obs=' · '.join(n for n in notes if n), quantidade=qtd,
                      status=status, origem=origem))

CAM, LEN, BAT, ARM, LUZ, GRIP, AUD, TRI, CAB, ACC, COM, MON, STR = (
    'Câmeras', 'Lentes', 'Baterias & Energia', 'Armazenamento', 'Iluminação', 'Grip & Maquinária', 'Áudio',
    'Tripés & Estabilizadores', 'Cabos & Conexões', 'Acessórios', 'Comunicação', 'Monitores', 'Streaming')

# ---------------- Câmeras ----------------
o = 'Aba Câmeras'
add('Blackmagic Pocket Cinema Camera 4K', CAM, 'QOQBGM113', 'Blackmagic', 'Pocket Cinema 4K',
    'DV battery plate adapter NP (S/N 10208001), AC (S/N 151027-11), Handle do cage (S/N 1638B, conferir), cabo Mini XLR–P2, adaptador Mini HDMI–HDMI, cabo A/C (adaptador NP), parafusos/Allen, carregador duplo XM-E6/E6N', origem=o)
add('Adaptador Viltrox EF-M1 (kit Pocket 4K)', CAM, '?', 'Viltrox', 'EF-M1', origem=o)
add('Bateria Canon LP-E6 2000mAh (kit Pocket 4K)', BAT, '', 'Canon', 'LP-E6', origem=o)

add('Câmera Canon C300', CAM, '532821400046', 'Canon', 'EOS C300',
    'Monitor C300 (01), microfone Panasonic AG-MC200 (XLR, com espuma), handle (01), A/C CA-940N 8.4V (S/N E327009), carregador da bateria (com cabo), case dos cartões', origem=o)
add('Cartão CF 64GB 120MB/s (kit C300)', ARM, 'BN190128049B', modelo='CF 64GB', origem=o)
add('Cartão CF 64GB 120MB/s (kit C300)', ARM, 'BN190528049B', modelo='CF 64GB', origem=o)
add('Bateria Canon BP-955 4900mAh', BAT, '201312 F', 'Canon', 'BP-955', origem=o)
add('Bateria Canon BP-970G 6300mAh', BAT, '', 'Canon', 'BP-970G', origem=o)
add('Leitor de cartão Insignia NS-DCR30D3K', ARM, '', 'Insignia', 'NS-DCR30D3K', origem=o)
add('Leitor de cartão All in 1', ARM, 'HU071159-11010', origem=o)

add('Câmera Sony FS7 01', CAM, 31608.0, 'Sony', 'PXW-FS7',
    'Monitor FS7 (01), microfone Sony ECM-VG1 (S/N 146322), handle, cabo XLR, AC BC-U1 (01) (S/N 14103004012)', origem=o)
add('Bateria Sony BP-U60 3.9Ah (01)', BAT, 5138855.0, 'Sony', 'BP-U60', origem=o)
add('Bateria Sony BP-U60 3.9Ah (02)', BAT, 5136698.0, 'Sony', 'BP-U60', origem=o)
add('Bateria Sony BP-U30 1.95Ah (07)', BAT, 318419.0, 'Sony', 'BP-U30', origem=o)
add('Cartão XQD 64GB 400MB/s (01)', ARM, '068CUS1519', modelo='XQD 64GB', origem=o)
add('Cartão XQD 64GB 400MB/s', ARM, '', modelo='XQD 64GB', obs='Marcado como "defeito" na planilha', qtd=2, status='bloqueado', origem=o)
add('Cartão XQD 120GB 440MB/s (01)', ARM, '04EH1KRA62', modelo='XQD 120GB', origem=o)
add('Cartão XQD 128GB 400MB/s (01)', ARM, '049DJS1517', modelo='XQD 128GB', origem=o)
add('Leitor XQD-USB (01)', ARM, 67.0, origem=o)
add('Adaptador Metabones EF-E Mount (01)', CAM, 'METABONES 01', 'Metabones', 'EF-E Mount', origem=o)

add('Câmera Sony FS7 02', CAM, '', 'Sony', 'PXW-FS7',
    'Monitor FS7 (02), microfone Sony ECM-VG1 (02), handle (02), cabo XLR, AC BC-U1 (02), carregador TC200 (S/N 414)', origem=o)
add('Bateria Sony BP-U60 3.9Ah (03)', BAT, 1244047.0, 'Sony', 'BP-U60', origem=o)
add('Bateria Sony BP-U60 3.9Ah (04)', BAT, 1243912.0, 'Sony', 'BP-U60', origem=o)
add('Bateria Sony BP-U60 3.9Ah (05)', BAT, 1243911.0, 'Sony', 'BP-U60', origem=o)
add('Bateria Sony BP-U30 1.95Ah (kit FS7 02)', BAT, '', 'Sony', 'BP-U30', origem=o)
add('Cartão XQD 64GB 400MB/s (02)', ARM, '069CJS1519', modelo='XQD 64GB', origem=o)
add('Cartão XQD 120GB 400MB/s (02)', ARM, '09AH1KR98M', modelo='XQD 120GB', origem=o)
add('Cartão XQD 128GB 440MB/s (02)', ARM, '050DJS1517', modelo='XQD 128GB', origem=o)
add('Leitor XQD-USB (02)', ARM, 52.0, origem=o)
add('Adaptador Metabones EF-E Mount Speedbooster (02)', CAM, '', 'Metabones', 'EF-E Speedbooster', origem=o)

add('Câmera Sony FS7 03', CAM, '', 'Sony', 'PXW-FS7', obs='Sem acessórios listados na planilha', origem=o)
add('Câmera Sony EX3', CAM, '', 'Sony', 'PMW-EX3', obs='Sem acessórios listados na planilha', origem=o)

add('Câmera RED Komodo', CAM, 'KMDBK020899', 'RED', 'Komodo', origem=o)
add('Cartão CFast RED PRO 512GB', ARM, 'AUCTH46', 'RED', 'CFast PRO 512GB', origem=o)
add('Cartão CFast RED PRO 512GB', ARM, 'ALEXJ3E', 'RED', 'CFast PRO 512GB', origem=o)
add('Bateria RED', BAT, 'BP622702207', 'RED', origem=o)
add('Bateria RED', BAT, 'BP622702216', 'RED', origem=o)

add('Câmera Blackmagic URSA Broadcast G2', CAM, '', 'Blackmagic', 'URSA Broadcast G2', obs='Sem nº de série e acessórios na planilha', origem=o)
add('Câmera Blackmagic URSA Broadcast G2', CAM, 10338593.0, 'Blackmagic', 'URSA Broadcast G2', 'Viewfinder URSA (S/N 3348066)', origem=o)
add('Câmera Blackmagic URSA Mini Pro G2 4.6K', CAM, 5499027.0, 'Blackmagic', 'URSA G2 4.6K', 'Viewfinder URSA (S/N 3051093)', obs='Na planilha: "CAMERA BLACKMAGICK G2 4.6"', origem=o)
add('Adaptador PL (kit URSA 4.6K)', CAM, '', origem=o)
for s in ('ATZNT6C', 'AUMUJY7', 'AVRKHLS'):
    add('Cartão AV PRO 256GB (kit URSA 4.6K)', ARM, s, '', 'AV PRO 256GB', origem=o)
add('Shoulder Tren', GRIP, '', origem='Aba Câmeras (Outros)')

# ---------------- Lentes ----------------
o = 'Aba Lentes'
pt = 'Parasol, tampas'
add('Lente Canon 24-105mm f/4', LEN, 3151223.0, 'Canon', 'EF 24-105 f/4', pt, origem=o)
add('Lente Canon 16-35mm f/2.8', LEN, 3739994.0, 'Canon', 'EF 16-35 f/2.8', pt, obs='Na planilha: "16-25 f2.8" — conferir', origem=o)
add('Lente Canon 70-200mm f/2.8', LEN, 4520009206.0, 'Canon', 'EF 70-200 f/2.8', origem=o)
add('Lente Rokinon 135mm T2.2', LEN, 'BCP16310', 'Rokinon', '135mm T2.2', pt, origem=o)
add('Lente Rokinon 85mm T1.5', LEN, 'E216L4758', 'Rokinon', '85mm T1.5', pt, origem=o)
add('Lente Rokinon 50mm', LEN, '', 'Rokinon', '50mm', obs='Abertura (T) incompleta na planilha', origem=o)
add('Lente Rokinon 35mm T1.5', LEN, 'E317I0112', 'Rokinon', '35mm T1.5', pt, origem=o)
add('Lente Rokinon 20mm T1.9', LEN, 'E216K7720', 'Rokinon', '20mm T1.9', pt, origem=o)
add('Lente Rokinon 14mm T3.1', LEN, 'E216K4588', 'Rokinon', '14mm T3.1', pt, origem=o)
add('Lente DZOFilm 20-55mm', LEN, '', 'DZOFilm', '20-55', 'Tampas (sem parasol)', origem=o)
add('Lente DZOFilm 50-125mm', LEN, '', 'DZOFilm', '50-125', 'Tampas (sem parasol)', origem=o)
add('Lente Zeiss 21-100mm', LEN, '', 'Zeiss', '21-100', 'Tampas (sem parasol)', origem=o)
add('Lente Fujinon Broadcast', LEN, '', 'Fujinon', 'BCST', pt, origem=o)
add('Kit de filtros (8 un.)', LEN, '', acess='Tamanhos 49, 52, 55, 58, 62, 67, 72, 77, 88mm · bocal para encaixe · paninho', origem=o)

# ---------------- Baterias e Carregadores ----------------
o = 'Aba Baterias e Carregadores'
add('Bateria Sony NP-F970 6600mAh', BAT, 'S09009', 'Sony', 'NP-F970', origem=o)
for i in range(4):
    add('Bateria Sony NP-F970 6600mAh', BAT, 'S03003', 'Sony', 'NP-F970', obs='Mesmo nº de série (S03003) em 4 baterias na planilha — conferir', origem=o)
add('Carregador duplo NP', BAT, '?', acess='Cabo', qtd=2, origem=o)
add('Bateria Anton Bauer NP-F774 4400mAh', BAT, 1703.0, 'Anton Bauer', 'NP-F774', origem=o)
add('Bateria V-Mount DUO-95 6.3Ah', BAT, '?', '', 'DUO-95', origem=o)
add('Bateria V-Mount DUO-95 6.3Ah', BAT, 'D41H0508', '', 'DUO-95', origem=o)
add('Bateria V-Mount DUO-95 6.3Ah', BAT, 'D41H0455', '', 'DUO-95', origem=o)
add('Bateria V-Mount CUE-D150 9.8Ah', BAT, 'A41I0208', '', 'CUE-D150', origem=o)
add('Carregador V-Mount Ni-MH Sony', BAT, '3-S00-306-01', 'Sony', acess='Cabo', origem=o)
add('Bateria Canon LP-E6', BAT, '2015 12', 'Canon', 'LP-E6', origem=o)
add('Bateria Sony NP-FW50', BAT, 'ZU12029', 'Sony', 'NP-FW50', origem=o)
add('Carregador Sony BC-VW1', BAT, '?', 'Sony', 'BC-VW1', origem=o)
add('Nobreak', BAT, '', origem=o)

# ---------------- Luz ----------------
o = 'Aba Luz, Rebatedores, Gelatinas'
add('Aputure 120d II (01)', LUZ, '6CD02W41258', 'Aputure', 'LS C120d II',
    'Painel de controle (S/N 6CD00S97280), panela, cabo A/C (velcro), cabo XLR 5 pinos (velcro), parafuso, alça, controle remoto, alça da bolsa, lente Fresnel (S/N 6DU00F30553), chimera', obs='Na planilha: "Aperture"', origem=o)
add('Aputure 120d II (02)', LUZ, '6CD00S97280', 'Aputure', 'LS C120d II',
    'Painel de controle (S/N 6CD02W41258), panela, cabo A/C (velcro), cabo XLR 5 pinos (velcro), parafuso, alça, controle remoto, alça da bolsa, chimera refletora', obs='Nºs de série do corpo e do painel aparecem trocados entre o 01 e o 02 — conferir', origem=o)
add('Amaran 200x', LUZ, '6HG03D00113', 'Amaran', '200x', 'Panela, cabo A/C padrão europeu (velcro), fonte com cabo XLR 3 pinos (EA12521M-40)', origem=o)
add('Amaran 200x', LUZ, '6HF00B53713', 'Amaran', '200x', 'Panela, cabo A/C padrão europeu (velcro), fonte com cabo XLR 3 pinos (EA12521M-40)', origem=o)
add('Painel de LED Godox LED500C', LUZ, 5227.0, 'Godox', 'LED500C', 'Difusores', origem=o)
add('Painel de LED Felloni2', LUZ, '10902301003678 BZ', '', 'Felloni2', origem=o)
add('Sungun de LED', LUZ, 312003653.0, acess='2 baterias NP-F550 2000–2200mAh, cabeça giratória', obs='Na planilha: "Sungum"', origem=o)
add('Nanlite PavoTube 15C (kit com 2)', LUZ, '', 'Nanlite', 'PavoTube 15C',
    'Cabo A/C, fonte, cabo para carregar os 2, cabo P2, garra para fixar, garra para segurar o tubo (HD-T12-1-LA), adaptador para tripé (HD-T12-1-CP), PA3 magnetic holder', origem=o)
add('Kit gelatinas (6 cores)', LUZ, '', acess='Laranja, amarelo, verde, vermelho, roxo, azul', origem=o)
for n in ('Difusor branco e preto', 'Pano prateado', 'Rebatedor de isopor', 'Modulador de luz preto', 'Rebatedor/isolador de luz', 'Difusor (no case)', 'Balão de luz'):
    add(n, GRIP, '', origem=o)
add('Kit bandeiras', GRIP, '', acess='6 ferragens, 2 bandeiras pequenas retangulares, 2 bandeiras pequenas redondas, 2 panos pretos, 2 panos soft, 1 bandeira 1/2 stop', origem=o)

# ---------------- Áudio ----------------
o = 'Aba Áudio'
add('Lapela Sennheiser EK 100 G3 (receptor + transmissor + cápsula)', AUD, '4270010421/4?300265?', 'Sennheiser', 'EW 100 G3', '2 cabos P2–XLR', origem=o)
add('Lapela Sennheiser EK 100 G3 (receptor + transmissor + cápsula)', AUD, '23291?066?/4034123786', 'Sennheiser', 'EW 100 G3', '2 cabos P2–P2', origem=o)
add('Lapela Sennheiser EK 100 G3 (receptor + transmissor + cápsula)', AUD, '4024077081/4441867017', 'Sennheiser', 'EW 100 G3', origem=o)
add('Microfone condensador Sony ECM-77B', AUD, '?', 'Sony', 'ECM-77B', '2 prendedores', origem=o)
add('Microfone shotgun Sennheiser MZW-400', AUD, 502364.0, 'Sennheiser', 'MZW-400', '2 tipos de espuma', origem=o)
add('Microfone de mão Sennheiser e835', AUD, '?', 'Sennheiser', 'e835', origem=o)
add('Gravador TASCAM DR-701D', AUD, '?', 'TASCAM', 'DR-701D', 'Case Diesner', origem=o)
add('Plug-on Sennheiser EW 100 G3', AUD, '', 'Sennheiser', 'EW 100 G3', origem=o)
add('Suporte do boom', AUD, '', origem=o)
add('Fone Audio-Technica QuietPoint', AUD, '', 'Audio-Technica', 'QuietPoint', origem=o)
add('Fone UFC Vip Experience', AUD, '', origem=o)
add('Mesa de som Alesis MultiMix 8', AUD, '(21)A41712113566873', 'Alesis', 'MultiMix 8', 'Fonte', obs='Aparece nas abas Áudio e Streaming (mesmo nº de série) — importado uma vez', origem='Abas Áudio e Streaming')

# ---------------- Tripés ----------------
o = 'Aba Tripé e Suporte'
add('Tripé Secced SC-V8-100AH', TRI, 'UN346110019', 'Secced', 'SC-V8-100AH', origem=o)
add('Tripé Manfrotto 546B', TRI, 'A2937684', 'Manfrotto', '546B', origem=o)
add('Tripé Vinten 20', TRI, '', 'Vinten', '20', obs='Na planilha: "Vintem"', origem=o)
for n in ('Tripé prata grande 01', 'Tripé prata grande 02', 'Tripé prata grande 03', 'Tripé preto grande', 'Tripé preto pequeno'):
    add(n, TRI, '', origem=o)
add('Tripé Sachtler', TRI, '', 'Sachtler', origem=o)
add('Tripé ARRI pequeno', TRI, '', 'ARRI', origem=o)
add('Gimbal DJI Ronin RS2 Pro Combo', TRI, '', 'DJI', 'RS2 Pro Combo', origem=o)

# ---------------- Cases e Acessórios ----------------
o = 'Aba Cases e Acessórios'
for n in ('Capas de lente de pano Canon (5 un.)', 'Capas de lente de pano Rokinon (5 un.)', 'Capa de lente 70-200 Rory Tory revestida',
          'Capa de lente Rory Tory revestida', 'Cinto para acoplar lentes', 'Case KATA', 'Case para gravador Stamaco',
          'Case de zíper preta para baterias', 'Case de tripé grande', 'Hard case SmallHD', 'Case de tripé pequeno',
          'Dome para GoPro Telesin', 'Pano de câmera', 'Longarinas 15cm (2 un.)', 'Pilhas recarregáveis Eneloop (12 un.)',
          'Carregadores de pilha recarregável (2 un.)', 'Suporte de lente'):
    add(n, ACC, '', origem=o)

# ---------------- Comunicação ----------------
o = 'Aba Comunicação'
add('Intercom Mars T1000 – Base', COM, '862009F809', '', 'Mars T1000', '3 antenas (1 quebrada), 3 cabos USB–USB-C', origem=o)
add('Intercom Mars T1000 – Transmissor 01', COM, '1202000I', '', 'Mars T1000', obs='Nº 1202000I sem nome na planilha — assumido como transmissor 01', origem=o)
for n in ('02', '03', '04'):
    add(f'Intercom Mars T1000 – Transmissor {n}', COM, '', '', 'Mars T1000', obs='Código 022025R repetido nos transmissores na planilha (parece ser o modelo)', origem=o)
add('Fonte A/C R241 0.8A (intercom)', COM, '', obs='Código 022025R na planilha', origem=o)
for n in range(1, 6):
    add(f'Fone de intercom {n:02d}', COM, '', modelo='SE-35-DM-HL', origem=o)
add('Espumas de fone (4 un.)', COM, '', origem=o)
add('Espumas de microfone (5 un.)', COM, '', origem=o)

# ---------------- Monitores ----------------
o = 'Aba Monitores'
add('Monitor Sony PVM-740 Trimaster EL', MON, 3001517.0, 'Sony', 'PVM-740', 'A/C AC-940W (S/N 3010515)', obs='Também listado na aba Câmeras ("Monitor Trimaster EL Sony c/ AC") — importado uma vez', origem='Abas Monitores e Câmeras')
add('Monitor SmallHD Focus 7', MON, 'F7AS190800044', 'SmallHD', 'Focus 7', obs='Também listado na aba Câmeras — importado uma vez', origem='Abas Monitores e Câmeras')
add('Monitor gravador Atomos Shogun Flame', MON, 'K6A94SHF50D27', 'Atomos', 'Shogun Flame', 'Adaptador XLR, A/C (S/N 170603006267), case SSD', obs='Aparece nas abas Monitores, Câmeras e Streaming (mesmo nº de série) — importado uma vez', origem='Abas Monitores, Câmeras e Streaming')
add('Monitor Samsung 4K', MON, '', 'Samsung', origem=o)
add('Monitor Samsung 27" Curve', MON, '', 'Samsung', origem=o)
add('TV Samsung', MON, '', 'Samsung', origem=o)
add('Monitor Dell', MON, '', 'Dell', acess='A/C', origem=o)

# ---------------- Streaming ----------------
o = 'Aba Streaming'
add('Placa de áudio Arcano OT-1 (vMix)', STR, '', 'Arcano', 'OT-1', origem=o)
add('Kit periféricos vMix', STR, '', acess='Teclado Multilaser, teclado Logitech, mouse Logitech com fio, mouse Logitech sem fio, mouse OEX, passador de slide Logitech, fone com adaptador P2 verde (Multilaser), fone com adaptador P2 vermelho', origem=o)
add('LiveU Solo', STR, 20204115585.0, 'LiveU', 'Solo', 'Modem Claro, modem Vivo, 2 extensores USB, A/C, case LiveU', origem=o)
add('Switcher Panasonic HS410', STR, '', 'Panasonic', 'HS410', 'Monitor AOC, A/C power cord, A/C do monitor, cabo HDMI, 2 adaptadores DVI–HDMI', origem=o)
add('Gravador AJA Ki Pro', STR, '', 'AJA', 'Ki Pro', 'Cabo A/C (ANATEL 01078941462017), fonte (KI-PRO-RO 2B14309)', origem=o)
add('Interface Behringer U-PHORIA UMC404HD', STR, 'S170934463BKU', 'Behringer', 'UMC404HD', 'Cabo USB', origem=o)
add('Switch de rede TP-Link LS1005G', STR, '', 'TP-Link', 'LS1005G', 'A/C', origem=o)
add('Extensor HDTV (HDTV Extender)', STR, '', acess='1 receiver com AC, 1 sender com AC', origem=o)
add('Splitter HDTV Lotus', STR, '', 'Lotus', acess='A/C', origem=o)
add('Conversor HDMI–SDI', STR, '', acess='Cabo USB', origem=o)
add('Placa de captura HDMI (HDMI Video Capture)', STR, '', acess='Cabo USB', origem=o)

# ---------------- Cabos (aba "Copy of Cabos", a mais completa) ----------------
o = 'Aba Copy of Cabos'
cab = [('Cabo SDI 15cm', 10), ('Cabo SDI 30cm', 12), ('Cabo SDI 1m', 5), ('Cabo SDI 2m', 1), ('Cabo SDI 10m', 4), ('Cabo SDI 15m', 1),
       ('Cabo SDI 30m', 4), ('Chicote SDI', 1),
       ('Cabo HDMI 1–5m', 8), ('Cabo HDMI 10m', 1), ('Cabo HDMI 15m', 2),
       ('Cabo de rede 1–5m', 10), ('Cabo de rede 15m', 2),
       ('Prolonga 5m', 2), ('Prolonga 10m', 1), ('Régua de tomadas', 6),
       ('Power cord 2 pinos', 8), ('Power cord 3 pinos', 12),
       ('Cabo XLR–XLR 1–2m', 10), ('Cabo XLR–XLR 3–5m', 3), ('Cabo XLR–XLR 10–15m', 3),
       ('Cabo P10–XLR', 7), ('Cabo P10–P10', 3), ('Cabo P2–P10', 1), ('Cabo DisplayPort–DisplayPort', 2),
       ('Adaptador HDMI–DisplayPort', 3), ('Cabo split XLR', 1), ('Cabo split P2–XLR', 1),
       ('Conversor SDI–HDMI Blackmagic', 3), ('Cabo USB-B–USB-A', 2)]
for n, q in cab:
    obs = 'SDI 30m: soma das duas colunas "30m" da planilha (1 + 3) — conferir' if n == 'Cabo SDI 30m' else ('Quantidade não informada na planilha' if n == 'Chicote SDI' else '')
    add(n, CAB, '', marca='Blackmagic' if 'Blackmagic' in n else '', obs=obs, qtd=q, origem=o)
add('Adaptadores diversos (18 un.)', CAB, '', origem=o)

# ---------- chaves de importação estáveis (evitam duplicar se importar de novo) ----------
seen = {}
for it in items:
    base = f"{it['nome']}|{it['serie']}|{it['acessorios']}"
    seen[base] = seen.get(base, 0) + 1
    it['chave'] = 'plan1-' + hashlib.sha1(f"{base}|{seen[base]}".encode()).hexdigest()[:12]

out = {'tipo': 'f2-importacao-equipamentos', 'versao': 1, 'fonte': 'Planilha_de_Equipamentos.xlsx',
       'geradoEm': '2026-11-17', 'equipamentos': items}
json.dump(out, open(sys.argv[1], 'w'), ensure_ascii=False, indent=1)
from collections import Counter
c = Counter(); u = Counter()
for it in items: c[it['categoria']] += 1; u[it['categoria']] += it['quantidade']
print('linhas', len(items), 'unidades', sum(it['quantidade'] for it in items))
for k in c: print(f'  {k}: {c[k]} linhas / {u[k]} un.')
print('com obs:', sum(1 for i in items if i['obs']))
