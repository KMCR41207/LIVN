import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Instagram, MessageCircle, Link, Check } from 'lucide-react';
import './ShareButton.css';

const ShareButton = ({ 
  url = window.location.href,
  title = 'Check out this amazing product from Livaani!',
  image = '',
  description = 'Beautiful ethnic wear from Livaani',
  size = 'medium',
  variant = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: '#25D366',
      share: () => {
        const text = encodeURIComponent(`${title}\n${url}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
      }
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: '#1877F2',
      share: () => {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: '#1DA1F2',
      share: () => {
        const text = encodeURIComponent(title);
        const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: '#E4405F',
      share: () => {
        // Instagram doesn't support direct sharing, so copy link
        copyToClipboard();
      }
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
        setIsOpen(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`share-button-container ${size} ${variant}`}>
      <button 
        className="share-trigger"
        onClick={handleNativeShare}
        aria-label="Share product"
      >
        <Share2 size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
        {variant === 'text' && <span>Share</span>}
      </button>

      {isOpen && !navigator.share && (
        <div className="share-dropdown">
          <div className="share-dropdown-header">
            <h4>Share this product</h4>
            <button 
              className="share-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close share menu"
            >
              ×
            </button>
          </div>
          
          <div className="share-options">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                className="share-option"
                onClick={() => {
                  option.share();
                  setIsOpen(false);
                }}
                style={{ '--option-color': option.color }}
              >
                <option.icon size={20} />
                <span>{option.name}</span>
              </button>
            ))}
            
            <button
              className="share-option copy-option"
              onClick={copyToClipboard}
            >
              {copied ? <Check size={20} /> : <Link size={20} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;