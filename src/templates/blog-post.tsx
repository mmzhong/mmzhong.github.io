import * as React from 'react';
import "katex/dist/katex.min.css";
import 'prismjs/themes/prism-okaidia.css';
import styled from 'styled-components';
import PageContainer from '../components/PageContainer';

const PostTitle = styled.h2`
  text-align: center;
`

const PostContent = styled.p`
  padding: 3rem 1rem;
`

export default ({ data }: Gatsby.ComponentProps) => {
  const post = data.markdownRemark;
  return (
    <PageContainer>
      <PostTitle>{ post.frontmatter.title }</PostTitle> 
      <PostContent dangerouslySetInnerHTML={{ __html: post.html }} />
    </PageContainer>
  )
}

export const query = graphql`
  query BlogPostQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
    }
  }
`