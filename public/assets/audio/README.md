# Звуки (SFX)

Одна папка = один тип події. У коді шлях від `public/assets/audio/`: `<Sfx src="whoosh/whoosh-fast.mp3" />`, у кроках `[t, 'pop/soft-pop.wav', 0.4]`.
Правила (CLAUDE.md): звук лише на реальну подію сцени (поява сцени, картка, склейка), кілька на хвилину; не на кожне слово.
Заборонено назавжди: `switch-click-quick.mp3`.
Новий звук: клади в потрібну папку, коротка назва англійською + ID джерела, рядок у таблицю нижче. Не сподобався після рендеру — видаляй файл і рядок, код підправимо.
Музика — `public/assets/music/` (`CATALOG.md`), не тут.

| Папка | Коли ставити | Підказка |
|---|---|---|
| `whoosh/` | Перехід між сценами, виліт картки чи тексту, зміна екрана | whoosh-fast — короткий; whoosh-cinematic — головна склейка, старт ролика |
| `pop/` | Поява картки, пункту списку, пігулки | soft-pop — тихий для списків; bubble-pop — грайливіше |
| `click/` | Клік мишкою, кнопка, перемикач, «замок» підтвердження | mouse-click — клік у браузері; lock-digital — «готово/увійшов» |
| `typing/` | Текст друкується на екрані (промпт, URL, команда) | один раз на початку друку, не на кожну літеру |
| `camera/` | Скріншот, спалах, «зняли кадр» | camera-shutter — скрін помилки; flash — фото/кадр |
| `impact/` | Удар: хук, «важливо», фінальна картка | impact-movie-epic — фінал StepVideo; bass-hit — «Не плутай!» |
| `riser/` | Наростання перед важливим моментом або дропом | ставити так, щоб пік збігся з появою |
| `glitch/` | Цифровий збій: помилка, зміна теми, показ коду |  |
| `notify/` | Повідомлення, новий пункт, заклик підписатися | ding — коротко; notification — повідомлення в чаті/телефоні |
| `sparkle/` | «Магія», результат, перевірка пройдена | shimmer-sparkle-sweep — «Перевірка ✓» |

## Файли й походження

| Файл | Джерело й ліцензія |
|---|---|
| `whoosh/air-whoosh-powerful.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/3220/3220-preview.mp3 |
| `whoosh/air-woosh-deep.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/2604/2604-preview.mp3 |
| `whoosh/arrow-whoosh-1491.wav` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/1491/1491-preview.mp3 |
| `whoosh/simple-whoosh-382724.mp3` | Pixabay Content License · ID 382724 (з назви `dragon-studio-simple-whoosh-382724.mp3`) |
| `whoosh/transition-snap.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/3115/3115-preview.mp3 |
| `whoosh/whoosh-cinematic-376875.mp3` | Pixabay Content License · ID 376875 (з назви `dragon-studio-whoosh-cinematic-376875.mp3`) |
| `whoosh/whoosh-effect-382717.mp3` | Pixabay Content License · ID 382717 (з назви `dragon-studio-whoosh-effect-382717.mp3`) |
| `whoosh/whoosh-end-384629.mp3` | Pixabay Content License · ID 384629 (з назви `soundreality-whoosh-end-384629.mp3`) |
| `whoosh/whoosh-fast.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/1490/1490-preview.mp3 |
| `pop/bubble-pop-04-323580.mp3` | Pixabay Content License · ID 323580 (з назви `universfield-bubble-pop-04-323580.mp3`) |
| `pop/bubble-pop-06-351337.mp3` | Pixabay Content License · ID 351337 (з назви `universfield-bubble-pop-06-351337.mp3`) |
| `pop/bubble-pop-389501.mp3` | Pixabay Content License · ID 389501 (з назви `u_xio2tir4to-bubble-pop-389501.mp3`) |
| `pop/bubble-pop-406640.mp3` | Pixabay Content License · ID 406640 (з назви `dragon-studio-bubble-pop-406640.mp3`) |
| `pop/pop-423717.mp3` | Pixabay Content License · ID 423717 (з назви `soundreality-pop-423717.mp3`) |
| `pop/soft-pop.wav` | додано в 335d613 без запису джерела — перевірити або замінити на bubble-pop |
| `click/lock-digital.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/2859/2859-preview.mp3 |
| `click/mouse-click-02-383961.mp3` | Pixabay Content License · ID 383961 (з назви `universfield-computer-mouse-click-02-383961.mp3`) |
| `click/mouse-click-290204.mp3` | Pixabay Content License · ID 290204 (з назви `matthewvakaliuk73627-mouse-click-290204.mp3`) |
| `click/mouse-click-352734.mp3` | Pixabay Content License · ID 352734 (з назви `universfield-computer-mouse-click-352734.mp3`) |
| `click/switch-tap.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/2585/2585-preview.mp3 |
| `typing/typewriter-digital.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/1363/1363-preview.mp3 |
| `typing/typewriter-hit-soft.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/1366/1366-preview.mp3 |
| `camera/camera-flash-2-494028.mp3` | Pixabay Content License · ID 494028 (з назви `kauasilbershlachparodes-camera-flash-2-494028.mp3`) |
| `camera/camera-flash-204151.mp3` | Pixabay Content License · ID 204151 (з назви `malarbrush-camera-flash-204151.mp3`) |
| `camera/camera-shutter-107889.mp3` | Pixabay Content License · ID 107889 (з назви `freesound_community-camera-shutter-107889.mp3`) |
| `camera/camera-shutter-click-1133.wav` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/1133/1133-preview.mp3 |
| `camera/camera-shutter-hard.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/1430/1430-preview.mp3 |
| `camera/canon-shutter-85733.mp3` | Pixabay Content License · ID 85733 (з назви `freesound_community-canon-40d-camera-shutter-85733.mp3`) |
| `impact/bass-hit-futuristic.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/2303/2303-preview.mp3 |
| `impact/impact-cine-big.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/788/788-preview.mp3 |
| `impact/impact-movie-epic.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/2901/2901-preview.mp3 |
| `impact/stomp-apocalyptic.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/3057/3057-preview.mp3 |
| `riser/riser-7-130957.mp3` | Pixabay Content License · ID 130957 (з назви `u_1pruylktlg-riser-7-130957.mp3`) |
| `riser/riser-procedural.wav` | власний, згенеровано ffmpeg (pink noise + sine sweep) |
| `glitch/glitch-crackles-1044.wav` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/1044/1044-preview.mp3 |
| `glitch/glitch-hd-379466.mp3` | Pixabay Content License · ID 379466 (з назви `virtual_vibes-glitch-sound-effect-hd-379466.mp3`) |
| `glitch/glitch-static-1457.wav` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/1457/1457-preview.mp3 |
| `glitch/small-electric-glitch-2595.wav` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/2595/2595-preview.mp3 |
| `notify/ding-101492.mp3` | Pixabay Content License · ID 101492 (з назви `freesound_community-ding-101492.mp3`) |
| `notify/ding-126626.mp3` | Pixabay Content License · ID 126626 (з назви `u_31vnwfmzt6-ding-126626.mp3`) |
| `notify/notification-040-493469.mp3` | Pixabay Content License · ID 493469 (з назви `universfield-new-notification-040-493469.mp3`) |
| `notify/notification-051-494246.mp3` | Pixabay Content License · ID 494246 (з назви `universfield-new-notification-051-494246.mp3`) |
| `notify/notification-3-398649.mp3` | Pixabay Content License · ID 398649 (з назви `dragon-studio-new-notification-3-398649.mp3`) |
| `sparkle/shimmer-sparkle-sweep.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/2633/2633-preview.mp3 |
| `sparkle/sparkle-touch.mp3` | Mixkit SFX Free License · https://assets.mixkit.co/active_storage/sfx/3083/3083-preview.mp3 |

Pixabay-файли додав Вадим 2026-10-13 (Pixabay Content License: безкоштовно, комерційно, без атрибуції; ID — з назви файлу).
Mixkit-файли першої бібліотеки — з `.claude/skills/video-shotcraft/assets/audio/` (URL першоджерела вище).
