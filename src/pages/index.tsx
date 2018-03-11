import * as React from 'react';
import styled from 'styled-components';
import Link, { navigateTo } from 'gatsby-link';
import { HelloGif } from '../components/Sticker';

const Container = styled.div`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%,-50%);
  padding: 10px 20px;
  border: 1px solid #9b4dca;
  border-radius: 16px;
  text-align: center;
`

const WelcomeSticker = styled.img`
  width: 240px;
  height: 240px;
  max-width: initial;
`

const Links = styled.div`
  display: flex;
  justify-content: center;
  @media (max-width: 40rem) {
    flex-direction: column;
  }
`

const StyledLink = styled(Link)`
  flex: 0 0 50%;
  @media (max-width: 40rem) {
    flex: 0 0 100%;
  }
`

const DirectLink = styled.a`
  flex: 0 0 50%;
  @media (max-width: 40rem) {
    flex: 0 0 100%;
  }
`;

const IndexPage = () => (
  <Container>
    <WelcomeSticker src={ HelloGif } alt="Welcome" />
    <Links>
      <StyledLink to="/blog/">Posts</StyledLink>
      <DirectLink href="https://github.com/mmzhong">Github</DirectLink>    
    </Links>
  </Container>
)

export default IndexPage
