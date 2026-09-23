/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The Class IX module used to live under /student-milestone; keep old links working
  async redirects() {
    return [
      { source: '/student-milestone', destination: '/classes/IX', permanent: true },
      { source: '/student-milestone/dashboard', destination: '/classes/IX', permanent: true },
      { source: '/student-milestone/settings', destination: '/settings', permanent: true },
      { source: '/student-milestone/students/:studentId', destination: '/classes/IX/students/:studentId', permanent: true },
      { source: '/student-milestone/:page(students|milestones|interventions|workflow)', destination: '/classes/IX/:page', permanent: true },
    ];
  },
};

export default nextConfig;
