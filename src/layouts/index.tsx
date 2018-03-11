import * as React from 'react';
import Helmet from 'react-helmet';

import Header from '../components/Header';
import * as logo from './favicon.ico';
import 'normalize.css';
import 'milligram';
import './index.css';

class TemplateWrapper extends React.PureComponent<Gatsby.ComponentProps, {}> {
  render () {
    const { children, data } = this.props;
    return (
      <main>
        <Helmet
          title={ data.site.siteMetadata.title }
          meta={[
            { name: 'description', content: 'mmzhong\'s blog' },
            { name: 'keywords', content: 'mmzhong, blog' },
          ]}
          link={[
            { rel: 'icon', href: logo }
          ]}
        />
        <div>
          {children()}
        </div>
      </main>
    );
  }
}

export default TemplateWrapper;

export const query = graphql`
  query IndexLayoutQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`