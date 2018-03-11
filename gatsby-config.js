module.exports = {
  siteMetadata: {
    title: 'Ming Zhong',
    author: 'mmzhong',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-typescript',
    'gatsby-plugin-styled-components',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'blog',
        path: `${__dirname}/blog/`,
      }
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          'gatsby-remark-katex',
          'gatsby-remark-prismjs',
          'gatsby-remark-copy-images',
        ]
      }
    }
  ],
};
