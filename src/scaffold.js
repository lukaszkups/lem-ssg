import fs from 'fs';

// Generate folder structure
export const generateProjectScaffold = () => {
  fs.mkdirSync('./content')
  fs.mkdirSync('./content/pages')
  fs.mkdirSync('./content/pages/blog')
  fs.mkdirSync(`./content/pages/blog/${new Date().getFullYear()}`)
  fs.mkdirSync('./content/pages/projects')
  fs.mkdirSync('./content/static')
  fs.mkdirSync('./content/static')
  fs.mkdirSync('./output')
  fs.mkdirSync('./theme')
  fs.mkdirSync('./theme/assets')
  fs.mkdirSync('./theme/assets/css')
  fs.mkdirSync('./theme/assets/fonts')
  fs.mkdirSync('./theme/assets/images')
  fs.mkdirSync('./theme/assets/js')
  fs.mkdirSync('./theme/templates')
}

export const generateExampleFiles = () => {
  
}
