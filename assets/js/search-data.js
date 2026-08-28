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
        },{id: "nav-library",
          title: "library",
          description: "Books, films, shows, articles, videos, and podcasts I keep returning to.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/library/";
          },
        },{id: "post-hobbies",
        
          title: "Hobbies",
        
        description: "Slowing down and smelling the roses",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/intentionality/";
          
        },
      },{id: "post-food",
        
          title: "Food",
        
        description: "My journey through cooking",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/food/";
          
        },
      },{id: "post-launching-my-personal-website",
        
          title: "Launching My Personal Website",
        
        description: "Building a digital home for research and hobbies",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/personal-website/";
          
        },
      },{id: "library-slaughterhouse-five",
        title: "Slaughterhouse-Five",
        description: "An intriguing exploration of concepts I care a lot about.",
        section: "Library",
        handler: () => {
          window.open("https://en.wikipedia.org/wiki/Slaughterhouse-Five", "_blank");
        },
      },{id: "library-the-silmarillion",
        title: "The Silmarillion",
        description: "I&#39;ve always loved myth, and the idea of writing a book that lets you develop your own myth system is so cool. I really appreciate the ideas it puts forth (I&#39;ll let you discover it for yourself).",
        section: "Library",
        handler: () => {
          window.open("https://en.wikipedia.org/wiki/The_Silmarillion", "_blank");
        },
      },{id: "library-top-25",
        title: "Top 25",
        description: "My top 25, ranked.",
        section: "Library",
        handler: () => {
          window.open("https://letterboxd.com/zedonkay/list/top-25/", "_blank");
        },
      },{id: "library-honorable-mentions",
        title: "Honorable Mentions",
        description: "Films I couldn&#39;t fit into the top 25, but that still deserve a mention, unranked.",
        section: "Library",
        handler: () => {
          window.open("https://letterboxd.com/zedonkay/list/honorable-mentions/", "_blank");
        },
      },{id: "library-bojack-horseman",
        title: "BoJack Horseman",
        description: "It&#39;s become a TV show I reference regularly. I think it does satire incredibly well, making good nuanced commentary about our society while balancing it with incredible humor and not being afraid make  you sit in your sadness.",
        section: "Library",
        handler: () => {
          window.open("https://en.wikipedia.org/wiki/BoJack_Horseman", "_blank");
        },
      },{id: "library-the-bear",
        title: "The Bear",
        description: "I just started it, but so far it&#39;s been a really incredible character study with amazing acting, cinematography, and direction. I like the culinary aspects too.",
        section: "Library",
        handler: () => {
          window.open("https://en.wikipedia.org/wiki/The_Bear_(TV_series)", "_blank");
        },
      },{id: "library-the-39-busy-39-trap",
        title: "The &#39;Busy&#39; Trap",
        description: "Something I really resonated with.",
        section: "Library",
        handler: () => {
          window.open("https://archive.nytimes.com/opinionator.blogs.nytimes.com/2012/06/30/the-busy-trap/?_r=1", "_blank");
        },
      },{id: "library-gen-z-feels-weird-talking-about-drinking-and-it-39-s-forcing-bars-to-change",
        title: "Gen Z feels weird talking about drinking — and it&#39;s forcing bars to...",
        description: "I&#39;ve gotten into making drinks but don&#39;t drink, so the rise of craft zero-proof cocktails is something I appreciate.",
        section: "Library",
        handler: () => {
          window.open("https://www.businessinsider.com/gen-z-unusual-approach-alcohol-forcing-bars-change-menu-strategy-2025-12", "_blank");
        },
      },{id: "library-still-standing-so-expensive",
        title: "Still Standing / So Expensive",
        description: "Gives incredible people, artists, craftsmen, and artisans a platform in a world that so often shuns or neglects creative pursuits. So Expensive is a companion, though that applies more to the handmade expensive things.",
        section: "Library",
        handler: () => {
          window.open("https://www.businessinsider.com/show/still-standing", "_blank");
        },
      },{id: "library-making-stuff",
        title: "Making Stuff",
        description: "An entertaining introduction to science that helped cultivate my interest.",
        section: "Library",
        handler: () => {
          window.open("https://www.pbs.org/wgbh/nova/series/making-stuff/", "_blank");
        },
      },{id: "library-great-big-story",
        title: "Great Big Story",
        description: "Gives a platform to the little people doing big things.",
        section: "Library",
        handler: () => {
          window.open("https://www.youtube.com/@GreatBigStory", "_blank");
        },
      },{id: "library-stuff-made-here",
        title: "Stuff Made Here",
        description: "Awesome, enjoyable, and well-made engineering projects.",
        section: "Library",
        handler: () => {
          window.open("https://www.youtube.com/@StuffMadeHere", "_blank");
        },
      },{id: "library-james-hoffmann",
        title: "James Hoffmann",
        description: "Informative, and makes &quot;fine&quot; things unpretentious while remaining honest to the fanciness.",
        section: "Library",
        handler: () => {
          window.open("https://www.youtube.com/@jameshoffmann", "_blank");
        },
      },{id: "library-hunting-the-elements",
        title: "Hunting the Elements",
        description: "This is what developed my interest in chemistry, which I believed for 10+ years would be my future.",
        section: "Library",
        handler: () => {
          window.open("https://www.pbs.org/wgbh/nova/physics/hunting-elements.html", "_blank");
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
