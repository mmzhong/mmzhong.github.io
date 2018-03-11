import { RootQueryType } from './graphql-types';

declare global {
  const graphql: (query: TemplateStringsArray) => void;
  namespace Gatsby {
    interface ComponentProps {
      children: () => React.ReactNode,
      data: RootQueryType
    }
  }
}
