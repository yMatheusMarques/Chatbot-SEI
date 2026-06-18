/**
 * knowledge-base.js (backend)
 * ---------------------------------------------------------------
 * Base de conhecimento do assistente virtual do Portal SEI Alagoas.
 * Mesmo conteúdo usado anteriormente no front-end, agora residindo
 * no backend, de onde o prompt de sistema é montado.
 * ---------------------------------------------------------------
 */

const SEI_KNOWLEDGE = `MANUAL SEI 4.0 - Sistema Eletrônico de Informações do Governo de Alagoas

## O que é o SEI?
O Sistema Eletrônico de Informações (SEI), desenvolvido pelo Tribunal Regional Federal da 4ª Região (TRF4), é um sistema de gestão de processos e documentos arquivísticos eletrônicos, com interface amigável e práticas inovadoras de trabalho. Integra o Processo Eletrônico Nacional (PEN), uma iniciativa conjunta de órgãos de diversas esferas da administração pública.

## Acesso ao Sistema / Login
Para acessar o SEI, o usuário deve acessar o portal e utilizar seu usuário e senha cadastrados. Em caso de dúvidas ou dificuldades, abrir chamado ao suporte indicando a dificuldade de acesso.

## Autenticação em Dois Fatores (2FA)
Para habilitar: acesse a tela de login, preencha usuário e senha, clique em "Autenticação em Dois Fatores". É necessário ter um aplicativo autenticador no celular (Google Authenticator ou Microsoft Authenticator). Leia o QR Code exibido, informe um e-mail pessoal (não institucional) e clique em Enviar. O sistema enviará um e-mail de habilitação com validade de 60 minutos. Para acessar, insira o código gerado pelo app. Dispositivos frequentes podem marcar "Não usar 2FA neste dispositivo" para não pedir código toda vez. Limpar cookies do navegador faz o código ser solicitado novamente. Para desativar o 2FA, clique em "Desativar 2FA" e confirme pelo link enviado ao e-mail cadastrado.

## Menu Principal
Barra vertical na lateral esquerda com funcionalidades em ordem alfabética. Funcionalidades disponíveis:
- Acompanhamento Especial: lista processos em acompanhamento especial
- Base de Conhecimento: orientações para instrução de processos
- Bloco de Assinatura: gerencia blocos para assinaturas de múltiplos usuários
- Blocos Internos: organização de conjuntos de processos visível só pela unidade
- Blocos de Reunião: disponibiliza processos para discussão em reuniões
- Controle de Prazos: gerenciamento de prazos de processos
- Controle de Processos: tela principal do SEI
- Estatística: visualiza estatísticas da unidade
- Favoritos: documentos salvos como modelos
- Iniciar Processo: inicia novo processo
- Marcadores: cria e gerencia marcadores para processos
- Painel de Controle: visão resumida personalizada
- Pesquisa: pesquisa avançada no SEI
- Retorno Programado: processos com prazos de resposta
- Texto Padrão: textos frequentes para documentos e e-mails

## Tela de Controle de Processos
Tela principal onde são apresentados todos os processos da unidade, divididos em:
1) Recebidos: processos recebidos de outras unidades
2) Gerados: processos gerados pela unidade atual
Permite operações em lote: Enviar, Atualizar Andamento, Atribuição, Incluir em Bloco, Sobrestar, Concluir, Anotações, Acompanhamento Especial, Incluir Documento, Adicionar/Remover Marcador, Controle de Prazos.

## Iniciar Processos
Para iniciar um processo: acesse "Iniciar Processo" no menu, escolha o tipo de processo, preencha as informações necessárias (especificação, classificação, interessados, observações, nível de acesso) e confirme. O processo receberá um número SEI automaticamente.

## Receber Processos
Processos enviados de outras unidades aparecem na coluna "Recebidos" da tela de Controle de Processos. Para recebê-lo formalmente, clique no número do processo.

## Enviar Processo
Para enviar processo a outra unidade: selecione o(s) processo(s), clique no ícone "Enviar Processo", escolha a unidade de destino, defina o prazo de retorno se necessário, e confirme. O processo desaparecerá da tela (recuperável pela Pesquisa ou Acompanhamento Especial). Use "Manter processo aberto na unidade atual" para manter acesso.

## Concluir Processos
Para concluir: selecione o(s) processo(s) na tela de Controle de Processos e clique em "Concluir Processo nesta Unidade". O processo some da tela mas pode ser recuperado pela Pesquisa.

## Reabrir Processos
Processos concluídos podem ser reabertos para novas ações quando necessário.

## Incluir Documento Interno
Para incluir documento: no processo, clique em "Incluir Documento", escolha o tipo de documento interno, preencha os dados (descrição, destinatários, texto), escolha o nível de acesso e confirme. O documento será criado com o editor do SEI. Documentos restritos têm acesso limitado a usuários autorizados.

## Editar Documentos
Documentos internos são editados diretamente pelo editor do SEI. É possível incluir imagens e referenciar outros documentos ou processos. O sistema mantém versões do documento para histórico.

## Assinar Documentos
Para assinar: abra o documento, clique no ícone de assinatura, insira sua senha de acesso e confirme. É possível assinar em bloco de assinatura para múltiplos usuários de qualquer unidade. Após assinado, o documento fica com o ícone de assinatura no processo.

## Incluir Documento Externo
Para incluir documento externo (PDF, etc.): no processo, clique em "Incluir Documento Externo", selecione o tipo, informe os dados, faça upload do arquivo e confirme. Documentos formais do órgão devem preferencialmente ser redigidos no editor do SEI (Documento Interno).

## Excluir e Cancelar Documentos
Documentos podem ser excluídos (antes de assinados) ou cancelados (após assinados). O cancelamento mantém o histórico do documento no processo.

## Pesquisa no SEI
Tipos de pesquisa disponíveis:
- Pesquisa Rápida: busca por número de documento ou processo diretamente pela barra de ferramentas
- Pesquisa Estruturada: pesquisa avançada com múltiplos filtros (tipo de processo, data, interessado, etc.)
- Pesquisa Restrita ao Processo: busca dentro de um processo específico

## Painel de Controle
Visão resumida e personalizada dos processos da unidade. Pode ser configurado e definido como página inicial. Permite filtros e personalizações por grupos e prioridades.

## Acompanhamento Especial
Permite incluir processos em lista de acompanhamento para monitoramento de trâmite e atualizações. Os grupos de acompanhamento devem ser criados previamente pela unidade.

## Controle de Prazos
Funcionalidade para gerenciar prazos de processos dentro da unidade. Permite registrar prazo, acompanhar vencimentos e concluir controles de prazo. Diferente do Retorno Programado (que é para prazos com outras unidades).

## Anotações e Comentários
Anotações: informações adicionais internas (lembretes), não visíveis para outras unidades.
Comentários: registros que ficam nos autos do processo.

## Marcadores
Etiquetas com cor e descrição para organização interna. Múltiplos marcadores podem ser adicionados em cada processo. 22 opções de cores disponíveis no SEI 4.0.

## Blocos
- Bloco Interno: organiza processos com alguma ligação. Visível só pela unidade criadora.
- Bloco de Reunião: disponibiliza processos para outras unidades verem sem atuar formalmente. Ideal para reuniões e decisões colegiadas.
- Bloco de Assinatura: permite que múltiplos usuários de qualquer unidade assinem documentos.

## Sobrestar Processos
Usado quando o processo precisa aguardar alguma providência antes de prosseguir. O processo fica suspenso temporariamente na unidade. Processos sobrestados ficam na lista "Processos Sobrestados" do menu.

## Relacionar e Anexar Processos
- Relacionar: cria vínculo entre processos relacionados (ficam como referência um do outro)
- Anexar: incorpora um processo como parte de outro processo

## Duplicar Processo
Cria uma cópia de um processo existente com os mesmos dados iniciais, sem os documentos.

## Gerar Arquivo ZIP ou PDF
É possível exportar um processo completo como arquivo ZIP (com todos os documentos) ou PDF consolidado para fins de preservação ou compartilhamento externo.

## Usuário Externo
O SEI permite disponibilizar acesso externo para que usuários externos (cidadãos, parceiros) acompanhem processos e assinem documentos eletronicamente.

## Textos Padrão
Textos frequentemente utilizados que podem ser salvos e reutilizados em documentos e e-mails produzidos no SEI. Acessível pelo menu "Texto Padrão".

## Favoritos
Documentos salvos como modelos para reutilização. Acessível pelo menu "Favoritos". Permite criar documentos a partir de modelos existentes.

## Estatísticas
Permite visualizar estatísticas da unidade e desempenho de processos. Inclui: Estatísticas da Unidade e Desempenho de Processos.

## Barra de Ferramentas
Permanece fixa no topo. Contém: Menu, Campo de pesquisa rápida, Unidade atual (permite troca), Controle de Processos, Novidades, Usuário, Configurações de cores (8 opções), Sair do sistema, Acessibilidade (teclas de atalho), Painel de Controle.

## Novidades do SEI 4.0
- Novo layout e interface reformulada
- Ícones mais modernos
- Autenticação em dois fatores
- Novo esquema de cores (testado por pessoas com deficiência visual) - 8 opções
- Possibilidade de uso de nome social
- Campo de busca no Menu Principal
- Melhorias nos Blocos (sinalizações, atribuição a usuário, organização em grupos)
- 22 novas opções de cores para marcadores
- Retorno programado aprimorado

## Nível de Acesso aos Documentos e Processos
- Público: qualquer usuário do sistema pode visualizar
- Restrito: acesso limitado por hipótese legal específica
- Sigiloso: acesso apenas a usuários com credencial de segurança

## Base de Conhecimento
Funcionalidade do SEI com orientações, definições e exigências para a correta instrução de tipos de processos. Auxilia servidores a entender como cada tipo de processo deve ser instruído.

## Pontos de Controle
Recursos de marcação para informar em qual etapa do fluxo o processo se encontra. Útil para rastrear progresso de processos dentro de fluxos de trabalho definidos.

## Retorno Programado
Controles programados para processos aos quais foram atribuídos prazos para resposta de outras unidades. Permite verificar processos enviados com prazo e processos recebidos com prazo de resposta.

## Boas Práticas recomendadas
1. Padronizar procedimentos dentro de órgãos e unidades
2. Transparência como regra: acesso público como padrão, sigilo como exceção justificada
3. Respeitar etapas do processo: concluir ou enviar o processo logo após as atividades
4. Dar preferência ao editor do SEI para documentos internos formais
`;

module.exports = { SEI_KNOWLEDGE };
