const getMenuItems = () => {
  const role = localStorage.getItem('role');

  const adminPages = [
    {
      id: 'manage-skills-subjects',
      title: 'Manage Skills & Subjects',
      type: 'collapse',
      icon: 'feather icon-layers',
      children: [
        {
          id: 'manage-skills',
          title: 'Manage Skills',
          type: 'item',
          url: '/skills/manage-skills'
        },
        {
          id: 'manage-subjects',
          title: 'Manage Subjects',
          type: 'item',
          url: '/subjects/manage-subjects'
        }
      ]
    },
    {
      id: 'manage-users',
      title: 'Manage Users',
      type: 'collapse',
      icon: 'feather icon-users',
      children: [
        {
          id: 'manage-students',
          title: 'Manage Students',
          type: 'item',
          url: '/users/manage-students'
        },
        {
          id: 'manage-teachers',
          title: 'Manage Teachers',
          type: 'item',
          url: '/users/manage-teachers'
        }
      ]
    },
    {
      id: 'manage-pfa',
      title: 'Manage PFA',
      type: 'item',
      url: '/pfa/manage-pfa',
      classes: 'nav-item',
      icon: 'feather icon-briefcase'
    },
    {
      id: 'manage-internships',
      title: 'Manage Internships',
      type: 'item',
      url: '/internships/manage-internships',
      classes: 'nav-item',
      icon: 'feather icon-briefcase'
    },
    {
      id: 'manage-periode',
      title: 'Manage Periode',
      type: 'item',
      url: '/periode/manage-periode',
      icon: 'feather icon-calendar'
    }
  ];

  const teacherPages = [
    {
      id: 'students-list',
      title: 'Students List',
      type: 'item',
      icon: 'feather icon-users',
      url: '/student/students-list'
    },
    {
      id: 'my-subjects',
      title: 'My Subjects',
      type: 'item',
      icon: 'feather icon-book',
      url: '/subject/subjects-list'
    },
    {
      id: 'my-pfas',
      title: 'My PFAs (supervised)',
      type: 'item',
      icon: 'feather icon-briefcase',
      url: '/pfa/pfa-list'
    },
    {
      id: 'my-internships',
      title: 'My Internships (supervised)',
      type: 'item',
      icon: 'feather icon-users',
      url: '/internships/internships-list'
    }
  ];
  const studentPages = [
    {
      id: 'student-skills',
      title: 'My Skills & Competences',
      type: 'item',
      icon: 'feather icon-award',
      url: '/skills-subjects/my-skills-subjects'
    },
    {
      id: 'student-pfa',
      title: 'My PFA',
      type: 'item',
      icon: 'feather icon-briefcase',
      url: '/pfa/my-pfa'
    },
    {
      id: 'student-internships',
      title: 'My Internships',
      type: 'item',
      icon: 'feather icon-activity',
      url: '/internships/my-internships'
    }
  ];

  return {
    items: [
      {
        id: 'navigation',
        title: 'Navigation',
        type: 'group',
        icon: 'icon-navigation',
        children: [
          {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            icon: 'feather icon-home',
            url: '/dashboard'
          }
        ]
      },
      {
        id: 'pages',
        title: 'Pages',
        type: 'group',
        icon: 'icon-pages',
        children: role === 'admin' ? adminPages : role === 'teacher' ? teacherPages : role === 'student' ? studentPages : []
      }
    ]
  };
};

export default getMenuItems;
