import { install, Browser, resolveBuildId, makeProgressCallback, detectBrowserPlatform } from '@puppeteer/browsers';
import puppeteer, { Product, Configuration } from 'puppeteer';
// @ts-ignore
import { PUPPETEER_REVISIONS } from 'puppeteer-core/internal/revisions.js';

/**
 * @internal
 */
const supportedProducts = {
  chrome: 'Chrome',
  firefox: 'Firefox Nightly'
} as const;

// 下载
export default async function () {
  // @ts-ignore
  const configuration = puppeteer.configuration as Configuration;

  const platform = detectBrowserPlatform();

  if (!platform) {
    throw new Error('The current platform is not supported.');
  }
  const downloadBaseUrl = configuration.downloadBaseUrl;
  const product = configuration.defaultProduct;
  const browser = productToBrowser(product);

  const unresolvedBuildId = configuration.browserRevision || PUPPETEER_REVISIONS[product] || 'latest';
  const buildId = await resolveBuildId(browser, platform, unresolvedBuildId);

  try {
    const result = await install({
      browser,
      cacheDir: configuration.cacheDirectory,
      platform,
      buildId,
      downloadProgressCallback: makeProgressCallback(browser, buildId),
      baseUrl: downloadBaseUrl
    });

    logPolitely(`${supportedProducts[product]} (${result.buildId}) downloaded to ${result.path}`);

    return puppeteer.executablePath();
  } catch (error) {
    console.error(`ERROR: Failed to set up ${supportedProducts[product]} r${buildId}! Set "PUPPETEER_SKIP_DOWNLOAD" env variable to skip download.`);
    console.error(error);
    process.exit(1);
  }
}
function productToBrowser(product?: Product) {
  switch (product) {
    case 'chrome':
      return Browser.CHROME;
    case 'firefox':
      return Browser.FIREFOX;
  }
  // return Browser.CHROME;
}

/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function logPolitely(toBeLogged: unknown): void {
  const logLevel = process.env['npm_config_loglevel'] || '';
  const logLevelDisplay = ['silent', 'error', 'warn'].indexOf(logLevel) > -1;

  // eslint-disable-next-line no-console
  if (!logLevelDisplay) {
    // console.log(toBeLogged);
  }
}
