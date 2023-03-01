import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import styled, { StyledComponent } from 'styled-components';
import style from './style';

const CopyLinkButton: StyledComponent = styled(
    ({ className, path }: { className: string; path: string }) => {
        const [copied, setCopied] = useState<boolean>(false);

        useEffect(() => {
            if (copied) {
                const hidePopoverTimer = setTimeout(() => {
                    setCopied(false);
                }, 2000);

                return () => clearTimeout(hidePopoverTimer);
            }
        }, [copied]);

        const handleCopyLinkToClipboard = async () => {
            await navigator.clipboard.writeText(
                `${window.location.origin}/#/${path}`
            );
            setCopied(true);
        };

        return (
            <Button
                className={className}
                onClick={handleCopyLinkToClipboard}
                disabled={copied}
            >
                {copied ? 'Link Copied' : 'Copy Link'}
            </Button>
        );
    }
)(style);

export default CopyLinkButton;
