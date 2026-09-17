/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;
let assetPrefix = '';
let basePath = '';

// Si se compila en GitHub Actions para GitHub Pages, configurar el subdirectorio del repo
if (isGithubActions) {
  const repo = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.replace(/.*?\//, '') : 'AYUDATDA';
  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
}

const nextConfig = {
  // Exportación estática para que la web funcione en GitHub Pages, Vercel o cualquier hosting sin servidor
  output: 'export',
  assetPrefix: assetPrefix || undefined,
  basePath: basePath || undefined,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
