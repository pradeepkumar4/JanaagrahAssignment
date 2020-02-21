import { LoginappPage } from './app.po';

describe('loginapp App', function() {
  let page: LoginappPage;

  beforeEach(() => {
    page = new LoginappPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
