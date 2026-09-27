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

## Vídeo 1 — alternativa landscape para desktop
- Fonte: Pexels
- Título: Doctor Using Laptop for Online Consultation
- ID: 8375485
- Autor: Tima Miroshnichenko
- URL: https://www.pexels.com/video/doctor-using-laptop-for-online-consultation-8375485/
- Uso: versão horizontal do primeiro take para desktop, evitando enquadramento vertical preso à direita.
- Trecho usado: aproximadamente 2s–8s do original.
- Áudio removido.

## Arquivos derivados
- telehealth-doctor.webm — VP9, 6 s, vertical do vídeo 1 para mobile.
- telehealth-doctor.mp4 — H.264, fallback mobile do vídeo 1.
- telehealth-doctor-1-landscape.webm — VP9, 6 s, landscape do vídeo 1 para desktop.
- telehealth-doctor-1-landscape.mp4 — H.264, fallback desktop do vídeo 1.
- telehealth-doctor-2.webm — VP9, 6 s, vídeo 2.
- telehealth-doctor-2.mp4 — H.264, fallback do vídeo 2.
- telehealth-doctor-3.webm — VP9, 6 s, vídeo 3.
- telehealth-doctor-3.mp4 — H.264, fallback do vídeo 3.
- telehealth-doctor-poster.jpg — frame estático para carregamento inicial.

## Implementação
A interface do hero continua em HTML/CSS real sob um overlay único e fixo. A rotação usa dois slots de vídeo: apenas o atual e o próximo participam do crossfade de 1,25 s. Depois da transição, o anterior é pausado e reutilizado para o take seguinte. A sequência permanece 1 → 2 → 3 → 1, evitando três players simultâneos em segundo plano no Safari/mobile. No desktop o vídeo 1 usa o asset landscape; no mobile usa o vertical original.
