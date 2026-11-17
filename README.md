# F2 Media — Equipamentos

Sistema desktop para controle de equipamentos da produtora.

- **Painel** com itens disponíveis, em uso, em manutenção, devoluções atrasadas e valor do patrimônio
- **Catálogo** com foto, categoria, marca/modelo, nº de série, valor de reposição, acessórios e histórico de uso
- **Saída** de equipamentos com **termo de retirada e responsabilidade** (imprimir ou salvar em PDF)
- **Entrada** (devolução) com conferência item a item, registro de avarias e **termo de devolução**. Devoluções parciais são aceitas.
- **Divergências**: item que volta com avaria, faltando acessório ou que não voltou abre uma divergência. Na devolução o sistema pergunta se o equipamento deve ficar **bloqueado** para novas saídas até ser resolvido.
- **Etiquetas** com QR Code e código de barras (térmicas 40×25, 50×30, 60×40 ou folha A4 com 24 etiquetas)
- **Leitor de código de barras/QR USB**: bipe um item em qualquer tela para abrir, adicionar à saída ou dar baixa na entrada
- Exportação do inventário para Excel (CSV), backup automático e backup manual
- Pasta de dados configurável: aponte para uma pasta de rede/Drive/OneDrive para usar em vários computadores
- **Atualização automática pelo GitHub**: quando sai uma nova versão, o app baixa sozinho e atualiza ao reiniciar, sem precisar desinstalar

---

## 1. Rodar no seu computador (desenvolvimento)

Pré-requisitos: [Node.js 20+](https://nodejs.org) e [Git](https://git-scm.com).

```bash
npm install
npm start
```

> Você também pode abrir `src/index.html` direto no navegador para testar (versão web, sem atualização automática).

## 2. GitHub

O código já está em https://github.com/DINFILMSS/F2-MEDIA. Para baixar e trabalhar nele:

```bash
git clone https://github.com/DINFILMSS/F2-MEDIA.git
cd F2-MEDIA
npm install
npm start
```

> O repositório precisa ser **público** para os computadores receberem as atualizações sem token.

## 3. Lançar uma versão (instalador + atualização)

```bash
npm version patch      # 1.0.0 → 1.0.1  (use "minor" para 1.1.0)
git push --follow-tags
```

O GitHub Actions monta o instalador do Windows e publica em **Releases** automaticamente (aba *Actions* para acompanhar, leva ~5 min).

- **Primeira instalação:** baixe `F2-Media-Setup-x.y.z.exe` em *Releases* e instale em cada computador.
- **Próximas versões:** os computadores que já têm o app recebem a atualização sozinhos (o app verifica ao abrir e a cada hora). Aparece a faixa "Nova versão pronta — Reiniciar e atualizar".

> Como o instalador não tem assinatura digital paga, o Windows pode mostrar "O Windows protegeu o computador" na primeira instalação: clique em **Mais informações → Executar assim mesmo**.

## Onde ficam os dados

Os dados **não** ficam dentro do app, então atualizar ou reinstalar não apaga nada.

- Padrão: `%APPDATA%\F2 Media Equipamentos\f2-equipamentos-dados.json`
- Backups automáticos: pasta `backups-f2` ao lado do arquivo de dados (últimos 30)
- Para usar em vários computadores: **Configurações → Dados & backup → Mudar pasta de dados** e escolha uma pasta compartilhada. Quando outro computador salva, a tela atualiza sozinha.

## Leitor de código de barras

Qualquer leitor USB que funcione como teclado (padrão) serve, inclusive os que leem QR Code.

- Na tela **Nova saída**, bipe para adicionar o item
- Na tela **Entrada**, bipe para marcar o item como devolvido
- Em qualquer outra tela, bipar abre a ficha do equipamento

## Estrutura

```
main.js              processo principal do Electron (arquivos, PDF, atualizações)
preload.js           ponte segura entre o app e o sistema
src/index.html       interface
src/app.js           telas e regras do sistema
src/codes.js         gerador de QR Code e código de barras (sem dependências)
src/store.js         armazenamento (arquivo no desktop / IndexedDB no navegador)
src/styles.css       visual
build/icon.png       ícone do app (troque pelo logo da empresa)
.github/workflows/   publicação automática das versões
```
