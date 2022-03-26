import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

export const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/sotatek-nhatnguyen2/final-web3",
  cache: new InMemoryCache(),
});

export const queryHistory = `
query($first: Int, $user: String, $orderDirection: String)
{
  depositEntities(
    first: $first, 
    orderBy: transactionTime,
    orderDirection: $orderDirection,
    where: {fromAcc: $user}
  ) {
    id
    fromAcc
    transactionTime
    amount
  }
  withdrawEntities(
    first: $first,
    orderBy: transactionTime,
    orderDirection: $orderDirection,
    where:  {fromAcc: $user}
  ) {
    id
    fromAcc
    transactionTime
    amount
  }
}
`;

export const queryGraph = async (query, conditions) => {
  return new Promise((resolve, reject) => {
    client
      .query({
        query: gql(query),
        variables: conditions,
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
