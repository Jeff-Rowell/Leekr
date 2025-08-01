import { Finding } from 'src/types/findings.types';
import { Suffix } from '../types/suffix.types';
import { retrieveFindings, storeFindings } from '../utils/helpers/common';
import { mergeFindings } from '../utils/helpers/mergeFindings';
import { findSecrets } from './scanner';


chrome.webRequest.onCompleted.addListener(
    async (details) => {
        const results = await chrome.storage.local.get(['suffixes', 'isExtensionEnabled']);

        var suffixValues: string[] = [];
        if (results && results.suffixes && Array.isArray(results.suffixes)) {
            suffixValues = results.suffixes.map((suffix: Suffix) => suffix.value);
        }

        const isExtensionEnabled = results && results.isExtensionEnabled;
        const isNotChromeExtension = !details.url.startsWith("chrome-extension");
        const matchesSuffix = suffixValues.length > 0 && suffixValues.some((suffix: string) => details.url.endsWith(suffix));

        if (isExtensionEnabled && isNotChromeExtension && matchesSuffix) {
            try {
                const response = await fetch(details.url);
                const bundleContent = await response.text();
                const newFindings = await findSecrets(bundleContent, details.url);
                const existingFindings: Finding[] = await retrieveFindings() || [];
                const updatedFindings: Finding[] = await mergeFindings(existingFindings, newFindings, details.url);
                const brandNewFindings = updatedFindings.filter(finding =>
                    !existingFindings.some(existingFinding =>
                        existingFinding.fingerprint === finding.fingerprint
                    )
                );
                
                // Mark only brand new findings as new, preserve existing isNew status for others
                const finalFindings = updatedFindings.map(finding => {
                    const isBrandNew = brandNewFindings.some(bf => bf.fingerprint === finding.fingerprint);
                    const existingFinding = existingFindings.find(ef => ef.fingerprint === finding.fingerprint);
                    
                    return {
                        ...finding,
                        isNew: isBrandNew ? true : (existingFinding?.isNew || false),
                        discoveredAt: existingFinding?.discoveredAt || finding.discoveredAt
                    };
                });
                
                storeFindings(finalFindings);
                chrome.storage.local.set({ "notifications": brandNewFindings.length.toString() }, function () {
                    if (brandNewFindings.length > 0) {
                        chrome.action.setBadgeText({ text: brandNewFindings.length.toString() });
                        chrome.action.setBadgeBackgroundColor({ color: '#FF141A' });
                        chrome.runtime.sendMessage({
                            type: 'NEW_NOTIFICATION',
                            payload: brandNewFindings.length.toString()
                        }).catch(() => {
                            chrome.storage.local.get(null);
                        });
                    }
                });

            } catch (err) {
                console.error('Error scanning JS file:', err);
            }
        }
    },
    { urls: ['<all_urls>'], types: ['script'] }
);