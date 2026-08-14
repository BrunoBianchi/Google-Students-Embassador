# Ações permitidas ao MiMo Guard

O MiMo Guard não executa ações diretamente. Ele retorna uma decisão estruturada, validada no servidor; somente então o backend aplica a ação à mensagem atual e ao seu autor.

| Decisão  | Efeito permitido no servidor                                            |
| -------- | ----------------------------------------------------------------------- |
| `delete` | Substitui a mensagem atual pelo aviso padrão de moderação automática.   |
| `mute`   | Exclui a mensagem e impede temporariamente o autor de enviar mensagens. |
| `remove` | Exclui a mensagem e remove o autor do fórum, sem banimento permanente.  |
| `ban`    | Exclui a mensagem e bane o autor do fórum.                              |

As ações não podem enviar mensagens, criar conteúdo, acessar prompts, procurar dados externos ou operar fora do escopo da análise atual. O backend também protege o dono do fórum contra remoção, silenciamento ou banimento automático; uma mensagem imprópria do dono ainda pode ser excluída.
