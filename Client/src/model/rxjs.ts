import type { ApolloClient, DocumentNode } from "@apollo/client";
import { Subject } from "rxjs";

export async function subscriptionsRxJS<GamesFeed>(apolloClient: ApolloClient, subscriptionQuery: DocumentNode): Promise<Subject<GamesFeed>> {
  const subject = new Subject<GamesFeed>();
  const apolloObservable = apolloClient.subscribe<GamesFeed>({ query: subscriptionQuery })
  apolloObservable.subscribe({
    next({data}) {
      if (data) {
        subject.next(data)
      }
    },
    error(err) {
      subject.error(err)
    },
    complete() {
      subject.complete() 
    },
  })
  return subject
}
