import { ImageData } from '../state/types.ts';
import { loadImage } from './image-processor.ts';

/**
 * Generates 4 aesthetic demo photos with artistic canvas rendering
 */
export async function generateDemoPhotos(): Promise<ImageData[]> {
  const width = 800;
  const height = 600;

  const demoPresets = [
    {
      title: '골든아워 노을',
      draw: (ctx: CanvasRenderingContext2D) => {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#f97316');
        grad.addColorStop(0.4, '#fb923c');
        grad.addColorStop(0.7, '#ec4899');
        grad.addColorStop(1, '#6366f1');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Sun
        ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.55, 110, 0, Math.PI * 2);
        ctx.fill();

        // Soft silhouette waves
        ctx.fillStyle = 'rgba(30, 27, 75, 0.85)';
        ctx.beginPath();
        ctx.moveTo(0, height * 0.7);
        ctx.bezierCurveTo(width * 0.3, height * 0.6, width * 0.7, height * 0.85, width, height * 0.75);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
      }
    },
    {
      title: '감성 카페 라떼',
      draw: (ctx: CanvasRenderingContext2D) => {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#e8d5c4');
        grad.addColorStop(0.5, '#d0b49f');
        grad.addColorStop(1, '#a47551');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Cup & Coffee
        ctx.fillStyle = '#fdfbf7';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, 170, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#6f4e37';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, 140, 0, Math.PI * 2);
        ctx.fill();

        // Latte art heart
        ctx.fillStyle = '#fdfbf7';
        ctx.beginPath();
        ctx.arc(width * 0.46, height * 0.47, 32, 0, Math.PI * 2);
        ctx.arc(width * 0.54, height * 0.47, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(width * 0.41, height * 0.49);
        ctx.lineTo(width * 0.5, height * 0.62);
        ctx.lineTo(width * 0.59, height * 0.49);
        ctx.closePath();
        ctx.fill();
      }
    },
    {
      title: '봄날 벚꽃 피크닉',
      draw: (ctx: CanvasRenderingContext2D) => {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#e0f2fe');
        grad.addColorStop(0.6, '#fce7f3');
        grad.addColorStop(1, '#fbcfe8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Cherry blossoms petals
        const colors = ['#f472b6', '#fb7185', '#fda4af', '#fff1f2'];
        for (let i = 0; i < 45; i++) {
          const px = Math.sin(i * 3.7) * width * 0.45 + width * 0.5;
          const py = Math.cos(i * 2.1) * height * 0.45 + height * 0.5;
          const pr = 12 + (i % 5) * 4;
          ctx.fillStyle = colors[i % colors.length];
          ctx.beginPath();
          ctx.ellipse(px, py, pr, pr * 0.65, (i * 30 * Math.PI) / 180, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    {
      title: '시티 나이트 네온',
      draw: (ctx: CanvasRenderingContext2D) => {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#312e81');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Neon glows
        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.beginPath();
        ctx.arc(width * 0.35, height * 0.4, 150, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.beginPath();
        ctx.arc(width * 0.65, height * 0.55, 160, 0, Math.PI * 2);
        ctx.fill();

        // City skyline lights
        ctx.fillStyle = '#f8fafc';
        for (let x = 80; x < width - 80; x += 40) {
          const lh = 50 + ((x * 13) % 180);
          ctx.fillRect(x, height - lh, 28, lh);
        }
      }
    }
  ];

  const results: ImageData[] = [];

  for (let i = 0; i < demoPresets.length; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    demoPresets[i].draw(ctx);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const imgElement = await loadImage(dataUrl);

    results.push({
      id: `demo_${Date.now()}_${i}`,
      image: imgElement,
      src: dataUrl,
      flipped: false,
      rotation: 0,
      filter: null,
      zoom: 100,
      offsetX: 0,
      offsetY: 0
    });
  }

  return results;
}
