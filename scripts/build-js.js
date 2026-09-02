const { Parcel } = require('@parcel/core');
const path = require('path');
const fs = require('fs');

const tempDir = path.join(__dirname, '../.tmp-build');

const bundler = new Parcel({
  entries: path.join(__dirname, '../public/js/index.js'),
  defaultConfig: '@parcel/config-default',
  targets: {
    default: {
      distDir: tempDir,
    },
  },
  mode: 'production',
});

async function build() {
  const { buildTime } = await bundler.run();
  const src = path.join(tempDir, 'index.js');
  const dest = path.join(__dirname, '../public/js/bundle.js');

  fs.copyFileSync(src, dest);

  const srcMap = src + '.map';
  const destMap = dest + '.map';
  if (fs.existsSync(srcMap)) {
    fs.copyFileSync(srcMap, destMap);
  }

  console.log(`✨ Built and copied to public/js/bundle.js in ${buildTime}ms`);
}

build();
