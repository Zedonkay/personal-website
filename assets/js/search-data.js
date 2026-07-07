// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-projects",
          title: "projects",
          description: "research, industry, and personal projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-publications",
          title: "publications",
          description: "publications and preprints in reversed chronological order.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "projects-autonomous-racing",
          title: 'Autonomous Racing',
          description: "Research at Carnegie Mellon Racing (CMR) into Model-free RL and Real2Sim2Real dynamics",
          section: "Projects",handler: () => {
              window.location.href = "/projects/CMR/";
            },},{id: "projects-robustifying-robot-learning-via-adaptive-uncertainty-sets",
          title: 'Robustifying Robot Learning via Adaptive Uncertainty Sets',
          description: "16-831 Final Project exploring Robust RL and Adaptive Uncertainty Sets",
          section: "Projects",handler: () => {
              window.location.href = "/projects/USPS/";
            },},{id: "projects-eigenbot",
          title: 'Eigenbot',
          description: "Research with biorobotics laboratory",
          section: "Projects",handler: () => {
              window.location.href = "/projects/eigenbot/";
            },},{id: "projects-rigging-magic",
          title: 'Rigging Magic',
          description: "15-418 Final Project exploring GPU-accelerated SPH fluid simulation with rigid-body coupling",
          section: "Projects",handler: () => {
              window.location.href = "/projects/rigging_magic/";
            },},{id: "projects-robodsl",
          title: 'RoboDSL',
          description: "A Domain-Specific Language for GPU-accelerated robotics applications with ROS2 and CUDA",
          section: "Projects",handler: () => {
              window.location.href = "/projects/robodsl/";
            },},{id: "projects-minimal-downtime-visual-inspection",
          title: 'Minimal-Downtime Visual Inspection',
          description: "Bridging CAD and Computer Vision for Smart Manufacturing at Siemens",
          section: "Projects",handler: () => {
              window.location.href = "/projects/siemens_2025/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%69%73%68%69%6B%68%61%72@%61%6E%64%72%65%77.%63%6D%75.%65%64%75", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/Zedonkay", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/ishikhar", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=gWnKO6kAAAAJ", "_blank");
        },
      },{
        id: 'social-letterboxd_username',
        title: 'Letterboxd_username',
        section: 'Socials',
        handler: () => {
          window.open("", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },];
