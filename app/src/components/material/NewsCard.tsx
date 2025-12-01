import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Stack,
  CardActionArea,
} from '@mui/material';
import { OpenInNew, Schedule } from '@mui/icons-material';

interface NewsCardProps {
  title: string;
  summary?: string;
  image?: string;
  source: string;
  published: string;
  category: string;
  link: string;
}

export function NewsCard({
  title,
  summary,
  image,
  source,
  published,
  category,
  link,
}: NewsCardProps) {
  
  const getCategoryColor = (cat: string) => {
    const catLower = cat.toLowerCase();
    if (catLower.includes('market')) return 'primary';
    if (catLower.includes('tech') || catLower.includes('ai')) return 'secondary';
    if (catLower.includes('crypto')) return 'warning';
    if (catLower.includes('world')) return 'info';
    if (catLower.includes('science')) return 'success';
    return 'default';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    } catch {
      return dateString;
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop';

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 8,
        },
      }}
    >
      <CardActionArea 
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        {/* Image */}
        <CardMedia
          component="img"
          height="200"
          image={image || fallbackImage}
          alt={title}
          sx={{
            objectFit: 'cover',
            backgroundColor: 'action.hover',
          }}
          onError={(e: any) => {
            e.target.src = fallbackImage;
          }}
        />

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Category and Time */}
          <Stack direction="row" spacing={1} mb={1.5} alignItems="center">
            <Chip 
              label={category}
              color={getCategoryColor(category)}
              size="small"
              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
            />
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Schedule sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {formatDate(published)}
              </Typography>
            </Stack>
          </Stack>

          {/* Title */}
          <Typography 
            variant="h6" 
            gutterBottom
            fontWeight={700}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
              mb: 1.5,
            }}
          >
            {title}
          </Typography>

          {/* Summary */}
          {summary && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.5,
                mb: 2,
              }}
            >
              {summary}
            </Typography>
          )}

          {/* Source and Link */}
          <Box mt="auto">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="primary.main" fontWeight={700}>
                {source}
              </Typography>
              <OpenInNew sx={{ fontSize: 16, color: 'action.active' }} />
            </Stack>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
