import type { IDL } from "@dfinity/candid"

export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const ContentType = IDL.Variant({
    'course': IDL.Null,
    'article': IDL.Null,
    'video': IDL.Null,
    'book': IDL.Null,
    'tutorial': IDL.Null,
    'workshop': IDL.Null
  });

  const Recommendation = IDL.Record({
    id: IDL.Principal,
    contentId: IDL.Text,
    contentType: ContentType,
    title: IDL.Text,
    description: IDL.Text,
    thumbnailUrl: IDL.Opt(IDL.Text),
    duration: IDL.Opt(IDL.Nat64),
    level: IDL.Opt(IDL.Text),
    rating: IDL.Opt(IDL.Nat8),
    provider: IDL.Opt(IDL.Text),
    tags: IDL.Vec(IDL.Text),
    viewed: IDL.Bool,
    clicked: IDL.Bool,
    completed: IDL.Bool,
    saved: IDL.Bool,
    createdAt: IDL.Nat64,
    similarityScore: IDL.Opt(IDL.Float64),
    reason: IDL.Opt(IDL.Text)
  });

  return IDL.Service({
    'getRecommendations': IDL.Func([IDL.Nat64], [IDL.Vec(Recommendation)], ['query']),
    'markAsViewed': IDL.Func([IDL.Principal], [], ['oneway']),
    'markAsClicked': IDL.Func([IDL.Principal], [], ['oneway']),
    'markAsCompleted': IDL.Func([IDL.Principal], [], ['oneway']),
    'saveRecommendation': IDL.Func([IDL.Principal], [], ['oneway']),
    'getRecommendationsByType': IDL.Func([ContentType, IDL.Nat64], [IDL.Vec(Recommendation)], ['query']),
    'getTrendingRecommendations': IDL.Func([IDL.Nat64], [IDL.Vec(Recommendation)], ['query']),
    'getSavedRecommendations': IDL.Func([IDL.Nat64], [IDL.Vec(Recommendation)], ['query'])
  });
};

export default idlFactory;
