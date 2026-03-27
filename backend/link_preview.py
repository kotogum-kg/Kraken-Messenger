"""
Link Preview Service
Fetches OpenGraph metadata from URLs
"""
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import logging
import re
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class LinkPreviewService:
    USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    TIMEOUT = 10
    
    @staticmethod
    def extract_urls(text: str) -> list[str]:
        """Extract URLs from text"""
        url_pattern = r'https?://[^\s<>"]+'
        return re.findall(url_pattern, text)
    
    @staticmethod
    async def get_preview(url: str) -> Optional[Dict[str, Any]]:
        """Get link preview metadata using OpenGraph tags"""
        try:
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                return None
            
            async with httpx.AsyncClient(
                timeout=LinkPreviewService.TIMEOUT,
                follow_redirects=True,
                headers={'User-Agent': LinkPreviewService.USER_AGENT}
            ) as client:
                response = await client.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'lxml')
                
                # Extract OpenGraph metadata
                og_title = soup.find('meta', property='og:title')
                og_description = soup.find('meta', property='og:description')
                og_image = soup.find('meta', property='og:image')
                og_site_name = soup.find('meta', property='og:site_name')
                og_type = soup.find('meta', property='og:type')
                
                # Fallbacks
                title = og_title['content'] if og_title else None
                if not title:
                    title_tag = soup.find('title')
                    title = title_tag.text.strip() if title_tag else None
                
                description = og_description['content'] if og_description else None
                if not description:
                    meta_desc = soup.find('meta', attrs={'name': 'description'})
                    description = meta_desc['content'] if meta_desc else None
                
                image = og_image['content'] if og_image else None
                # Make image URL absolute
                if image and not image.startswith('http'):
                    image = f"{parsed.scheme}://{parsed.netloc}{image}"
                
                site_name = og_site_name['content'] if og_site_name else parsed.netloc
                content_type = og_type['content'] if og_type else 'website'
                
                # Get favicon
                favicon = None
                icon_link = soup.find('link', rel=lambda x: x and 'icon' in x.lower() if isinstance(x, str) else x and any('icon' in r.lower() for r in x))
                if icon_link and icon_link.get('href'):
                    favicon = icon_link['href']
                    if not favicon.startswith('http'):
                        favicon = f"{parsed.scheme}://{parsed.netloc}{favicon}"
                
                if not title:
                    return None
                
                return {
                    'url': url,
                    'title': title[:200] if title else None,
                    'description': description[:500] if description else None,
                    'image': image,
                    'siteName': site_name,
                    'favicon': favicon,
                    'type': content_type
                }
                
        except httpx.TimeoutException:
            logger.warning(f"Timeout fetching preview for {url}")
            return None
        except httpx.HTTPStatusError as e:
            logger.warning(f"HTTP error {e.response.status_code} for {url}")
            return None
        except Exception as e:
            logger.error(f"Error fetching preview for {url}: {e}")
            return None
