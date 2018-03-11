import * as React from 'react';
import Link from 'gatsby-link';
import styled from 'styled-components';
import PageContainer from '../components/PageContainer';

const BlogHeader = styled.h3`
  text-align: center;
`

const BlogList = styled.ul`
  margin: 0 auto;
  list-style: none;
`

const BlogItem = styled.li`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 1.6rem 0;
  border-bottom: 1px solid #acb4bb;
`
const BlogDate = styled.span`
  white-space: nowrap;
  @media (max-width: 40rem) {
    display: none;
  }
`

const BlogTitle = styled.h3`
  white-space: nowrap;
  margin: 0 0 0  1.6rem;
`

export default ({ data }: Gatsby.ComponentProps) => {
  return (
    <PageContainer>
      <BlogHeader>Ming Zhong</BlogHeader>
      <BlogList>
        {
          data.allMarkdownRemark.edges.map(({ node }, index) => (
            <BlogItem key={ index }>
              <BlogDate>{ node.frontmatter.createdDate }</BlogDate>
              <Link
                to={ node.fields.slug }
              >
                <BlogTitle>{ node.frontmatter.title }</BlogTitle>
              </Link>
            </BlogItem>
          ))
        }
      </BlogList>
    </PageContainer>
  )
}

export const query = graphql`
  query BlogQuery {
    allMarkdownRemark(sort: {fields: [frontmatter___createdDate], order: DESC}) {
      totalCount
      edges {
        node {
          frontmatter {
            title
            desc
            tags
            createdDate(formatString: "MMM DD, YYYY")
          }
          fields {
            slug
          }
        }
      }
    }
  }
`