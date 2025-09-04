import { GraphQLClient, gql } from "graphql-request";

// !! 重要提示 !!
// 下面的 URL 是一个占位符。
// 在我们后面将子图部署到 The Graph 的托管服务后，需要回来用真实的查询URL替换它。
const SUBGRAPH_URL =
  "https://api.studio.thegraph.com/query/119458/edu-3/version/latest";

const client = new GraphQLClient(SUBGRAPH_URL);

// 定义获取所有课程的 GraphQL 查询语句
export const GET_ALL_COURSES = gql`
  query GetCourses {
    courses {
      id
      creator {
        id
      }
      priceInYd
      createdAtTimestamp
      purchaseCount
    }
  }
`;

export default client;
