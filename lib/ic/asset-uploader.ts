import { type Identity } from '@dfinity/agent'
import { IDL } from '@dfinity/candid'
import { createActor, ASSET_CANISTER_ID } from './agent'

// IDL for the asset canister batch upload subset.
const assetIdl = ({ IDL: I }: { IDL: typeof IDL }) => {
  const BatchId = I.Nat
  const ChunkId = I.Nat
  const Key = I.Text
  const CreateBatchResponse = I.Record({ batch_id: BatchId })
  const CreateChunkResponse = I.Record({ chunk_id: ChunkId })
  const Unset = I.Record({})
  const SetAssetContentArguments = I.Record({
    key: Key,
    sha256: I.Opt(I.Vec(I.Nat8)),
    chunk_ids: I.Vec(ChunkId),
    content_encoding: I.Text, // 'identity'
  })
  const CommitBatchArguments = I.Record({
    batch_id: BatchId,
    operations: I.Vec(
      I.Variant({
        CreateAsset: I.Record({ key: Key, content_type: I.Text }),
        SetAssetContent: SetAssetContentArguments,
        UnsetAssetContent: I.Record({ key: Key, content_encoding: I.Text }),
        DeleteAsset: I.Record({ key: Key }),
        Clear: Unset,
      })
    ),
  })
  return IDL.Service({
    create_batch: I.Func([I.Record({})], [CreateBatchResponse], []),
    create_chunk: I.Func(
      [I.Record({ batch_id: BatchId, content: I.Vec(I.Nat8) })],
      [CreateChunkResponse],
      []
    ),
    commit_batch: I.Func([CommitBatchArguments], [], []),
  })
}

type AssetActor = {
  create_batch: (arg: Record<string, never>) => Promise<{ batch_id: bigint }>
  create_chunk: (arg: { batch_id: bigint; content: Uint8Array }) => Promise<{ chunk_id: bigint }>
  commit_batch: (arg: {
    batch_id: bigint
    operations: any[]
  }) => Promise<void>
}

export async function createAssetActor(identity?: Identity): Promise<AssetActor> {
  return createActor<AssetActor>(ASSET_CANISTER_ID, assetIdl as any, identity)
}

/**
 * Upload a file to an ICP Asset canister using batch APIs.
 * Returns a public URL you can serve via the asset canister gateway.
 */
export async function uploadToAssetCanister(file: File, key: string, identity?: Identity): Promise<string> {
  const actor = await createAssetActor(identity)

  // 1. Create a batch
  const { batch_id } = await actor.create_batch({})

  // 2. Split file into chunks (1MB default)
  const CHUNK_SIZE = 1024 * 1024
  const chunkIds: bigint[] = []
  const buffer = new Uint8Array(await file.arrayBuffer())

  for (let offset = 0; offset < buffer.length; offset += CHUNK_SIZE) {
    const chunk = buffer.subarray(offset, Math.min(offset + CHUNK_SIZE, buffer.length))
    const { chunk_id } = await actor.create_chunk({ batch_id, content: chunk })
    chunkIds.push(chunk_id)
  }

  // 3. Commit batch with CreateAsset and SetAssetContent operations
  const contentType = file.type || 'application/octet-stream'
  await actor.commit_batch({
    batch_id,
    operations: [
      { CreateAsset: { key, content_type: contentType } },
      {
        SetAssetContent: {
          key,
          sha256: [],
          chunk_ids: chunkIds,
          content_encoding: 'identity',
        },
      },
    ],
  })

  // 4. Build URL (ic0.app gateway)
  const host = location.hostname.includes('localhost') || location.hostname.includes('127.0.0.1')
    ? `http://127.0.0.1:4943`
    : `https://${ASSET_CANISTER_ID}.ic0.app`

  const url = host.includes('4943')
    ? `${host}/?canisterId=${ASSET_CANISTER_ID}&asset=${encodeURIComponent(key)}`
    : `${host}/${encodeURIComponent(key)}`

  return url
}
