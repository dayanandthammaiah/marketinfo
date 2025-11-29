"""
Multi-source data aggregator with fallback mechanisms for reliable data fetching.
"""
import logging
import asyncio
from typing import Dict, List, Callable, Any, Optional
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)


class DataAggregator:
    """Manages multi-source data fetching with automatic fallback."""
    
    def __init__(self):
        self.cache = {}
        self.source_status = {}
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    async def fetch_with_fallback(
        self, 
        sources: List[Callable], 
        source_names: List[str],
        *args, 
        **kwargs
    ) -> Optional[Any]:
        """
        Attempt to fetch data from multiple sources with fallback.
        
        Args:
            sources: List of async callable functions to fetch data
            source_names: Names of the sources for logging
            *args, **kwargs: Arguments to pass to source functions
        
        Returns:
            Data from first successful source, or None if all fail
        """
        for source, name in zip(sources, source_names):
            try:
                logger.info(f"Attempting to fetch from {name}...")
                data = await source(*args, **kwargs)
                
                if data:
                    logger.info(f"✓ Successfully fetched from {name}")
                    self.source_status[name] = 'success'
                    return data
                    
            except Exception as e:
                logger.warning(f"✗ Failed to fetch from {name}: {e}")
                self.source_status[name] = 'failed'
                continue
        
        logger.error("All data sources failed")
        return None
    
    async def fetch_concurrent(
        self, 
        fetch_funcs: List[Callable],
        max_concurrent: int = 5
    ) -> List[Any]:
        """
        Execute multiple fetch operations concurrently with rate limiting.
        
        Args:
            fetch_funcs: List of async functions to execute
            max_concurrent: Maximum number of concurrent requests
        
        Returns:
            List of results from all functions
        """
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def limited_fetch(func):
            async with semaphore:
                try:
                    return await func()
                except Exception as e:
                    logger.error(f"Error in concurrent fetch: {e}")
                    return None
        
        tasks = [limited_fetch(func) for func in fetch_funcs]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and None values
        return [r for r in results if r is not None and not isinstance(r, Exception)]
    
    def normalize_stock_data(self, data: Dict, source: str) -> Dict:
        """Normalize stock data from different sources to common format."""
        if source == 'yfinance':
            return data  # Already in our format
        elif source == 'alphavantage':
            # Transform Alpha Vantage format to our format
            return self._transform_alphavantage(data)
        return data
    
    def normalize_crypto_data(self, data: Dict, source: str) -> Dict:
        """Normalize crypto data from different sources to common format."""
        if source == 'coingecko':
            return data  # Already in our format
        elif source == 'coincap':
            return self._transform_coincap(data)
        elif source == 'binance':
            return self._transform_binance(data)
        return data
    
    def _transform_alphavantage(self, data: Dict) -> Dict:
        """Transform Alpha Vantage data to our format."""
        # Placeholder - implement if using Alpha Vantage
        return data
    
    def _transform_coincap(self, data: Dict) -> Dict:
        """Transform CoinCap data to our format."""
        # Placeholder - implement if using CoinCap
        return data
    
    def _transform_binance(self, data: Dict) -> Dict:
        """Transform Binance data to our format."""
        # Placeholder - implement if using Binance
        return data


# Global aggregator instance
aggregator = DataAggregator()
