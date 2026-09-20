# Hero /consulta — fontes dos assets

## Vídeo principal
- Fonte: Pexels
- Título: A Doctor Having Online Consultation on Her Laptop
- ID: 8375467
- Autor: Tima Miroshnichenko
- URL: https://www.pexels.com/video/a-doctor-having-online-consultation-on-her-laptop-8375467/
- Uso: vídeo real de banco, sem geração por IA.
- Trecho usado no preview: aproximadamente 2s–8s do original.
- Áudio removido.

## Vídeo 2
- Fonte: Pexels
- Título: A Doctor Giving Online Consultation
- ID: 8375757
- Autor: Tima Miroshnichenko
- URL: https://www.pexels.com/video/a-doctor-giving-online-consultation-8375757/
- Uso: vídeo real de banco, sem geração por IA.
- Trecho usado: aproximadamente 4s–10s do original.
- Áudio removido.

## Vídeo 3
- Fonte: Pexels
- Título: A Lady Doctor Using Laptop to Ease Her Work
- ID: 5998413
- URL: https://www.pexels.com/video/a-lady-doctor-using-laptop-to-ease-her-work-5998413/
- Uso: vídeo real de banco, sem geração por IA.
- Trecho usado: aproximadamente 3s–9s do original.
- Áudio removido.

## Arquivos derivados
- telehealth-doctor.webm — VP9, 6 s, 720x1366, vídeo 1.
- telehealth-doctor.mp4 — H.264, 6 s, fallback do vídeo 1.
- telehealth-doctor-2.webm — VP9, 6 s, vídeo 2.
- telehealth-doctor-2.mp4 — H.264, 6 s, fallback do vídeo 2.
- telehealth-doctor-3.webm — VP9, 6 s, vídeo 3.
- telehealth-doctor-3.mp4 — H.264, 6 s, fallback do vídeo 3.
- telehealth-doctor-poster.jpg — frame estático para carregamento inicial.

## Implementação
A interface do hero continua em HTML/CSS real. Os três vídeos ficam em layers absolutas sob um overlay único e fixo. Os três permanecem em autoplay/muted/loop, e a rotação 1 → 2 → 3 → 1 altera apenas a opacidade com crossfade de 1,25 s; texto, preço, CTA e fluxo da consulta permanecem independentes da mídia.
