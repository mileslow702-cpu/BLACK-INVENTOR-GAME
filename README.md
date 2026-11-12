# BLUEPRINT

A Mario 64–style 3D browser game from the Do Better Network. The Ghost Writer has sealed Black inventors and scientists inside glass cases as nameless statues. Nova jumps into the paintings in the Hall of Record, melts three wax seals per world, and frees each inventor.

Plain HTML and JavaScript with three.js r128 from a CDN, no build step. Deploy the repo root as a static site (Vercel: framework preset "Other").

- `index.html`: page, UI and styles
- `js/core.js`: renderer, input, sound
- `js/move.js`: movement, camera, animation
- `js/hall.js`: the Hall of Record
- `js/world1*.js`: World 1, The Shape of the Earth (Dr. Gladys West)
- `js/world2*.js`: World 2, Sound Check (James E. West)
- `js/cases.js`: inventors, glass cases, seals
- `js/game.js`: flow, cutscenes, saves
