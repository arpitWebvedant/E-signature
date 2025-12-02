"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { createApiKey, listApiKeys, revokeApiKey } from "@/services/api-set-up/handleApi";

type ApiKeyListItem = {
  id: number;
  name: string | null;
  prefix: string;
  lastEight: string;
  revokedAt: string | null;
  createdAt: string;
};

export default function TokensPage() {
  const { toast } = useToast();
  const organizationId = JSON.parse(localStorage.getItem("user") || '{}')?.organizationId;
  const [loading, setLoading] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [revokingId, setRevokingId] = React.useState<number | null>(null);
  const [name, setName] = React.useState("");
  const [keys, setKeys] = React.useState<ApiKeyListItem[]>([]);

  const [showPlaintext, setShowPlaintext] = React.useState(false);
  const [newKeyPreview, setNewKeyPreview] = React.useState<string>("");
  const [newKeyPlaintext, setNewKeyPlaintext] = React.useState<string>("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listApiKeys({organizationId});
      if (res?.success) {
        setKeys(res.data as ApiKeyListItem[]);
      } else {
        throw new Error(res?.message || "Failed to fetch API keys");
      }
    } catch (e: any) {
      toast({ title: "Could not load keys", description: e?.message || "" });
    } finally {
      setLoading(false);
    }
  }, [toast, organizationId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onCreate = async () => {
    setCreating(true);
    try {
      const payload = organizationId && name ? { name , organizationId } : {};
      const res = await createApiKey(payload);
      if (res?.success) {
        setNewKeyPreview(res.key?.preview || "");
        setNewKeyPlaintext(res.key?.plaintext || "");
        setShowPlaintext(true);
        setName("");
        await load();
      } else {
        throw new Error(res?.message || "Failed to create API key");
      }
    } catch (e: any) {
      toast({ title: "Create failed", description: e?.message || "" });
    } finally {
      setCreating(false);
    }
  };

  const onRevoke = async (id: number) => {
    setRevokingId(id);
    try {
      const res = await revokeApiKey(id);
      if (res?.success) {
        toast({ title: "Key revoked" });
        await load();
      } else {
        throw new Error(res?.message || "Failed to revoke API key");
      }
    } catch (e: any) {
      toast({ title: "Revoke failed", description: e?.message || "" });
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold">API Tokens</h2>
          <p className="text-sm text-gray-500">Create personal API keys to access the API.</p>
        </div>
      </div>

      <div className="p-4 bg-white rounded-lg border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Optional token name (e.g., My CI Token)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="sm:max-w-xs"
          />
          <Button onClick={onCreate} disabled={creating}>
            {creating ? "Creating..." : "Create API Key"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium">Your Keys</h3>
        </div>
        <div className="overflow-x-auto p-4">
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : keys.length === 0 ? (
            <div className="text-sm text-gray-500">No keys yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Preview</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => {
                  const preview = `${k.prefix}...${k.lastEight}`;
                  const isRevoked = Boolean(k.revokedAt);
                  return (
                    <tr key={k.id} className="border-t">
                      <td className="py-2 pr-4">{k.name || "Untitled"}</td>
                      <td className="py-2 pr-4 font-mono">{preview}</td>
                      <td className="py-2 pr-4">{new Date(k.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-4">
                        {isRevoked ? (
                          <span className="text-red-600">Revoked</span>
                        ) : (
                          <span className="text-green-600">Active</span>
                        )}
                      </td>
                      <td className="py-2 pr-0 text-right">
                        <Button
                          variant="ghost"
                          disabled={isRevoked || revokingId === k.id}
                          onClick={() => onRevoke(k.id)}
                        >
                          {revokingId === k.id ? "Revoking..." : "Revoke"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={showPlaintext} onOpenChange={setShowPlaintext}>
        <DialogContent position="center">
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              This is the only time you will see the plaintext token. Copy and store it securely.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-500">Preview</div>
              <div className="font-mono text-sm">{newKeyPreview}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Plaintext</div>
              <div className="p-2 font-mono text-sm break-all bg-gray-50 rounded border">
                {newKeyPlaintext}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(newKeyPlaintext);
                toast({ title: "Copied to clipboard" });
              }}
              className='flex-1 cursor-pointer bg-black/5 hover:bg-black/10'
              variant='outline'
            >
              Copy
            </Button>
            <Button onClick={() => setShowPlaintext(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
