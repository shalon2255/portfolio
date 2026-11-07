/* EDIT THIS FILE ONLY — all text on the site lives here.
   Content is based on Shalon's resume (Shalon_Rodrigs_Game_Developer.pdf). */
window.CONFIG = {
  name: "Shalon Rodrigs",
  role: "Unity Game Developer",
  location: "Kodungallur, Kerala, India",

  // order = menu order
  sections: [
    {
      id: "profile", label: "PROFILE", title: "PLAYER PROFILE", img: "assets/profile.webp", accent: "#ffc82e",
      dialog: "Hi, I'm Shalon — a Unity Game Developer who ships complete games. I design, program and publish 3D games in C#: The Final Gambit, a 3D chess combat game with an AI opponent and Photon online multiplayer, and Until We Wake, a medieval war game you can play right now on itch.io. I own the whole pipeline — gameplay systems, combat, cinematic animation, UI and Blender assets — and I build data-driven systems that a team can extend.",
      chips: [["ROLE", "Unity Game Dev"], ["ENGINE", "Unity 6 · URP"], ["BUILT", "2 full games"], ["FOCUS", "Combat · Systems"]],
      play: ["▶ PLAY MY GAME", "https://shalonrodrigs.itch.io/until-we-wake"],
    },
    {
      id: "career", label: "CAREER", title: "CAREER PATH", img: "assets/career.webp", accent: "#ff9a3c",
      // x / y = hotspot position over the stairs image (% of image). Climb the stairs from the bottom.
      steps: [
        { icon: "💻", name: "FULL STACK", when: "JUN 2025 – FEB 2026", title: "Python Full Stack Intern", org: "Luminar Technolab, Kochi", x: 44, y: 78,
          points: ["Built and deployed full-stack web applications using Python, Django, DRF, React and MySQL.", "Worked in an Agile team using Git / GitHub for planning, development, testing and deployment."] },
        { icon: "🎮", name: "UNITY DEV", when: "AUG 2026 – PRESENT", title: "Unity Game Developer", org: "Self-employed", x: 66.5, y: 72,
          points: ["Designed, programmed and published 3D Unity games in C#, including The Final Gambit and Until We Wake.", "Own the full pipeline: gameplay systems, animation integration, UI, and 3D assets via Blender and Mixamo.", "Build data-driven gameplay systems with ScriptableObjects and reusable C# components, so weapons, stats and upgrades are easy to extend.", "Integrate Photon online multiplayer and design combat flow, health and respawn logic, and result screens for networked matches."] },
        { icon: "⭐", name: "NEXT", when: "NEXT LEVEL", title: "Unity / Gameplay Programmer", org: "Your studio?", x: 85, y: 50,
          points: ["Ready to bring combat, animation and multiplayer experience to a studio team.", "Want to talk? Open CONTACT — I reply fast."] },
      ],
      start: 1,
    },
    {
      id: "education", label: "EDUCATION", title: "EDUCATION", img: "assets/education.webp", accent: "#ffd23f",
      items: [
        ["2025", "Bachelor of Computer Applications (BCA)", "Mahatma Gandhi University, Kerala, India"],
        ["ONGOING", "Game development, learned by shipping", "Unity 6, C#, Blender, Mixamo and Photon — through building and publishing two games."],
      ],
    },
    {
      id: "projects", label: "PROJECTS", title: "LEVEL SELECT", img: "assets/projects.webp", accent: "#7c5cff",
      projects: [
        { lvl: "LEVEL 1", name: "The Final Gambit — 3D Chess Combat Game", tag: "UNITY 6 · C# · URP", status: "ONLINE MULTIPLAYER · AI · COMBAT",
          cover: "assets/gambit-cover.webp", spark: [78, 37], sparkAlt: "gold",
          points: ["Built a 3D chess game in Unity 6 with full chess rules, an AI opponent, Photon online multiplayer, and a Combat Mode that adds health and weapons to matches.", "Engineered a cinematic attack system with custom Humanoid animations, slow motion, camera cuts and synced audio, reused across multiple weapons and characters.", "Architected a data-driven weapon system with ScriptableObjects, plus a coin economy and a store with 5 upgrade tiers per weapon type.", "Created the full UI: animated main menu, combat HUD with health bars, weapon store and result screens."] },
        { lvl: "LEVEL 2", name: "Until We Wake — Medieval 3D War Game", tag: "UNITY · C# · LIVE ON ITCH.IO", status: "PUBLISHED · PLAYABLE NOW",
          cover: "assets/medieval-cover.webp", spark: [50, 41],
          links: [["▶ PLAY ON ITCH.IO", "https://shalonrodrigs.itch.io/until-we-wake"]],
          points: ["Built and published a medieval combat game featuring swordsmen and spearmen in tactical battlefield encounters.", "Implemented an ally army system with a unit spawner and state-driven AI (follow, attack, victory) for troops fighting beside the player.", "Developed melee combat and enemy behavior with synced character animations and cinematic fight sequences.", "Modeled and rigged 3D characters and props in Blender, integrated as Humanoid avatars with Mixamo animations in Unity."] },
      ],
    },
    {
      id: "skills", label: "SKILLS", title: "INVENTORY — SKILLS", img: "assets/skills.webp", accent: "#38e1ff",
      // [icon, name, description]
      groups: [
        ["GAMEPLAY SYSTEMS", [["🏃", "Third-person controller", "Player movement and third-person controllers."], ["⚔️", "Combat systems", "Melee and weapon combat, hit interactions and combat flow."], ["🎯", "Missions & interactions", "Mission flow, interactive objects and triggers."], ["❤️", "Health & respawn", "Health, damage, respawn logic and result screens."], ["🪙", "Economy & store", "Coin economy and an upgrade store with 5 tiers per weapon type."], ["♟️", "Chess rules & AI", "Full chess rules with an AI opponent."]]],
        ["AI & MULTIPLAYER", [["🤖", "State-driven AI", "Follow, attack and victory states for allied and enemy units."], ["🛡️", "Ally army system", "Unit spawner for troops fighting beside the player."], ["🌐", "Photon multiplayer", "Online matches with networked combat flow."]]],
        ["CINEMATICS & ANIMATION", [["🕺", "Humanoid animation", "Custom Humanoid animation workflows in Unity."], ["🏃‍♂️", "Mixamo", "Mixamo animation integration."], ["🎥", "Cinematic camera", "Camera cuts and cinematic attack sequences."], ["🐌", "Slow motion", "Slow-motion hit moments with synced audio."]]],
        ["ARCHITECTURE & PHYSICS", [["📦", "ScriptableObjects", "Data-driven weapons, stats and upgrades that are easy to extend."], ["🧩", "Reusable C# components", "Components reused across weapons and characters."], ["🧲", "Rigidbody physics", "Rigidbody-based movement and forces."], ["💥", "Collisions & triggers", "Collider setups and trigger volumes."], ["🔦", "Raycasts", "Raycast checks for aiming and interaction."], ["⚡", "Basic optimization", "Performance-conscious gameplay code."]]],
        ["UI & TOOLS", [["🖼️", "Game UI", "Animated main menu, combat HUD with health bars, store and result screens."], ["🎮", "Unity 6 · URP", "Game engine and render pipeline."], ["#️⃣", "C#", "Gameplay scripting."], ["🧊", "Blender", "Modeling and rigging of characters and props."], ["🌿", "Git / GitHub", "Version control and team workflow."]]],
        ["WEB (BONUS LEVEL)", [["🐍", "Python / Django / DRF", "Back-end web development."], ["⚛️", "React", "Front-end UI."], ["🗄️", "MySQL", "Relational databases."]]],
      ],
    },
    {
      id: "about", label: "ABOUT", title: "CHARACTER SHEET", img: "assets/about.webp", accent: "#ff5fa2",
      sheet: [["NAME", "Shalon Rodrigs"], ["CLASS", "Unity Game Developer"], ["BASE", "Kodungallur, Kerala"], ["MAIN WEAPON", "Unity 6 + C#"], ["SPECIALTY", "Combat · Cinematics"], ["SIDE QUEST", "Python Full Stack"]],
      heading2: "WHY HIRE ME",
      passives: [
        "I ship. Two complete Unity games built end to end — one live on itch.io for anyone to play.",
        "I own the pipeline: gameplay code, animation integration, UI and Blender 3D assets.",
        "I build for teams: data-driven ScriptableObject systems and reusable C# components that are easy to extend.",
        "I've tackled the hard parts: Photon online multiplayer, AI opponents and cinematic combat.",
        "Agile and Git-fluent from a full-stack internship — I test, debug and iterate.",
      ],
      quest: "ACTIVE QUEST: Join a studio as a Unity / Gameplay Programmer. Ready to start — open CONTACT and let's talk.",
    },
    {
      id: "contact", label: "CONTACT", title: "HIRE ME", img: "assets/contact.webp", accent: "#ff4d4d",
      sub: "Got a quest for me? Pick up the phone — or send a message.",
      // [label, text shown, link, copy-button?]
      links: [
        ["EMAIL", "shalon2255@gmail.com", "mailto:shalon2255@gmail.com", true],
        ["PHONE", "+91 73065 35922", "tel:+917306535922", true],
        ["LINKEDIN", "linkedin.com/in/shalon-rodrigs", "https://www.linkedin.com/in/shalon-rodrigs-875ba7357/", true],
        ["GITHUB", "github.com/shalon2255", "https://github.com/shalon2255", true],
        ["ITCH.IO", "shalonrodrigs.itch.io", "https://shalonrodrigs.itch.io", true],
        ["BASE", "Kodungallur, Kerala, India", "", false],
      ],
      resume: { label: "⬇ DOWNLOAD RESUME", file: "assets/Shalon_Rodrigs_Resume.pdf", name: "Shalon_Rodrigs_Resume.pdf" },
    },
  ],
};
