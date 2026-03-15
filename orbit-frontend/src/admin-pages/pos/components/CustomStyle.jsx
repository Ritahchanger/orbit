const CustomStyle = () => {
  return (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        .thermal-font { font-family: 'Share Tech Mono', 'Courier New', monospace; }
        .receipt-paper {
          background: #fafaf8;
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 23px,
              rgba(0,0,0,0.015) 23px,
              rgba(0,0,0,0.015) 24px
            );
        }
        .torn-top {
          background: #fafaf8;
          clip-path: polygon(
            0% 8px, 1.5% 0%, 3% 8px, 4.5% 0%, 6% 8px, 7.5% 0%, 9% 8px,
            10.5% 0%, 12% 8px, 13.5% 0%, 15% 8px, 16.5% 0%, 18% 8px,
            19.5% 0%, 21% 8px, 22.5% 0%, 24% 8px, 25.5% 0%, 27% 8px,
            28.5% 0%, 30% 8px, 31.5% 0%, 33% 8px, 34.5% 0%, 36% 8px,
            37.5% 0%, 39% 8px, 40.5% 0%, 42% 8px, 43.5% 0%, 45% 8px,
            46.5% 0%, 48% 8px, 49.5% 0%, 51% 8px, 52.5% 0%, 54% 8px,
            55.5% 0%, 57% 8px, 58.5% 0%, 60% 8px, 61.5% 0%, 63% 8px,
            64.5% 0%, 66% 8px, 67.5% 0%, 69% 8px, 70.5% 0%, 72% 8px,
            73.5% 0%, 75% 8px, 76.5% 0%, 78% 8px, 79.5% 0%, 81% 8px,
            82.5% 0%, 84% 8px, 85.5% 0%, 87% 8px, 88.5% 0%, 90% 8px,
            91.5% 0%, 93% 8px, 94.5% 0%, 96% 8px, 97.5% 0%, 99% 8px,
            100% 0%, 100% 100%, 0% 100%
          );
        }
        .torn-bottom {
          background: #fafaf8;
          clip-path: polygon(
            0% 0%, 100% 0%, 100% calc(100% - 8px),
            99% 100%, 97.5% calc(100% - 8px), 96% 100%, 94.5% calc(100% - 8px),
            93% 100%, 91.5% calc(100% - 8px), 90% 100%, 88.5% calc(100% - 8px),
            87% 100%, 85.5% calc(100% - 8px), 84% 100%, 82.5% calc(100% - 8px),
            81% 100%, 79.5% calc(100% - 8px), 78% 100%, 76.5% calc(100% - 8px),
            75% 100%, 73.5% calc(100% - 8px), 72% 100%, 70.5% calc(100% - 8px),
            69% 100%, 67.5% calc(100% - 8px), 66% 100%, 64.5% calc(100% - 8px),
            63% 100%, 61.5% calc(100% - 8px), 60% 100%, 58.5% calc(100% - 8px),
            57% 100%, 55.5% calc(100% - 8px), 54% 100%, 52.5% calc(100% - 8px),
            51% 100%, 49.5% calc(100% - 8px), 48% 100%, 46.5% calc(100% - 8px),
            45% 100%, 43.5% calc(100% - 8px), 42% 100%, 40.5% calc(100% - 8px),
            39% 100%, 37.5% calc(100% - 8px), 36% 100%, 34.5% calc(100% - 8px),
            33% 100%, 31.5% calc(100% - 8px), 30% 100%, 28.5% calc(100% - 8px),
            27% 100%, 25.5% calc(100% - 8px), 24% 100%, 22.5% calc(100% - 8px),
            21% 100%, 19.5% calc(100% - 8px), 18% 100%, 16.5% calc(100% - 8px),
            15% 100%, 13.5% calc(100% - 8px), 12% 100%, 10.5% calc(100% - 8px),
            9% 100%, 7.5% calc(100% - 8px), 6% 100%, 4.5% calc(100% - 8px),
            3% 100%, 1.5% calc(100% - 8px), 0% 100%
          );
        }
      `}</style>
  );
};

export default CustomStyle;
