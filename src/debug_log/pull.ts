import qs from "node:querystring";

export default async (req: Bun.BunRequest<"/debug_log">) => {
  const _qs = qs.parse(req.url) as {
    id: string;
    updatedAt: string;
    limit: string;
  };

  const documents: string[] = [];
  const newCheckpoint = { id: _qs.id, updatedAt: Number(_qs.updatedAt) };
  const response = { documents: documents, checkpoint: newCheckpoint };

  return Response.json(response);
};
