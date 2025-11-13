import { useState } from "react";
import { Copy, Check, Code, Globe, Plus, X } from "lucide-react";

interface EmbedCodeDisplayProps {
  embedKey: string;
  allowedDomains?: string[];
  isEmbeddable?: boolean;
  onUpdateDomains: (domains: string[], isEmbeddable: boolean) => void;
}

export default function EmbedCodeDisplay({
  embedKey,
  allowedDomains = [],
  isEmbeddable = false,
  onUpdateDomains,
}: EmbedCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [localDomains, setLocalDomains] = useState<string[]>(allowedDomains);
  const [localIsEmbeddable, setLocalIsEmbeddable] = useState(isEmbeddable);

  const embedUrl = `${window.location.origin}/embed.html?embedKey=${embedKey}`;
  const embedCode = `<!-- Chatbot Embed Widget -->
<script 
  src="${window.location.origin}/embed-loader.js" 
  data-embed-key="${embedKey}"
></script>`;

  const iframeCode = `<iframe 
  src="${embedUrl}" 
  width="400" 
  height="600" 
  frameborder="0"
  style="border: none; position: fixed; bottom: 20px; right: 20px; z-index: 9999;"
></iframe>`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddDomain = () => {
    if (newDomain && !localDomains.includes(newDomain)) {
      const updated = [...localDomains, newDomain];
      setLocalDomains(updated);
      setNewDomain("");
      onUpdateDomains(updated, localIsEmbeddable);
    }
  };

  const handleRemoveDomain = (domain: string) => {
    const updated = localDomains.filter((d) => d !== domain);
    setLocalDomains(updated);
    onUpdateDomains(updated, localIsEmbeddable);
  };

  const handleToggleEmbeddable = (value: boolean) => {
    setLocalIsEmbeddable(value);
    onUpdateDomains(localDomains, value);
  };

  return (
    <div className="space-y-6">
      {/* Enable Embedding */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Enable Embedding</h4>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localIsEmbeddable}
              onChange={(e) => handleToggleEmbeddable(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <p className="text-sm text-gray-600">
          {localIsEmbeddable
            ? "This chatbot can be embedded on external websites"
            : "Enable this to allow embedding on external websites"}
        </p>
      </div>

      {localIsEmbeddable && (
        <>
          {/* Domain Whitelist */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <Globe className="w-5 h-5 text-gray-600" />
              <h4 className="font-semibold text-gray-900">Allowed Domains</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Specify which domains can embed this chatbot. Leave empty to allow all
              domains.
            </p>

            {/* Add Domain Input */}
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddDomain()}
                placeholder="example.com or https://example.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
              <button
                onClick={handleAddDomain}
                disabled={!newDomain}
                className="btn-primary flex items-center space-x-1 px-4 py-2 text-sm disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Domain List */}
            {localDomains.length > 0 ? (
              <div className="space-y-2">
                {localDomains.map((domain) => (
                  <div
                    key={domain}
                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-700">{domain}</span>
                    <button
                      onClick={() => handleRemoveDomain(domain)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                No domains added. The chatbot will work on any domain.
              </div>
            )}
          </div>

          {/* Embed Code */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Embed Code (Script)</h4>
              </div>
              <button
                onClick={() => handleCopy(embedCode)}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
              <code>{embedCode}</code>
            </pre>
            <p className="text-sm text-gray-600 mt-2">
              Add this code before the closing <code>&lt;/body&gt;</code> tag of your
              website
            </p>
          </div>

          {/* iFrame Code */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Embed Code (iFrame)</h4>
              </div>
              <button
                onClick={() => handleCopy(iframeCode)}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
              <code>{iframeCode}</code>
            </pre>
            <p className="text-sm text-gray-600 mt-2">
              Alternative method: Add this iFrame code to your website
            </p>
          </div>

          {/* Test URL */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Test Widget</h4>
            <p className="text-sm text-blue-800 mb-3">
              Open this URL to test your chatbot widget:
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={embedUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm"
              />
              <button
                onClick={() => window.open(embedUrl, "_blank")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Open
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

