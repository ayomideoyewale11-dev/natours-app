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
});

async function watch() {
  await bundler.watch((err, event) => {
    if (err) {
      throw err;
    }
    if (event.type === 'buildSuccess') {
      const src = path.join(tempDir, 'index.js');
      const dest = path.join(__dirname, '../public/js/bundle.js');

      fs.copyFileSync(src, dest);

      const srcMap = src + '.map';
      const destMap = dest + '.map';
      if (fs.existsSync(srcMap)) {
        fs.copyFileSync(srcMap, destMap);
      }

      console.log('✨ Bundled to public/js/bundle.js');
    } else if (event.type === 'buildFailure') {
      console.log(event.diagnostics);
    }
  });
}

watch();
