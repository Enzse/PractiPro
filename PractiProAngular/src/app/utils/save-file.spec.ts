import { saveAs } from './save-file';

describe('saveAs', () => {
  it('downloads the blob under the given name and cleans up', () => {
    vi.useFakeTimers();
    URL.createObjectURL = vi.fn(() => 'blob:fake-url');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.href).toBe('blob:fake-url');
      expect(this.download).toBe('resume.pdf');
    });

    saveAs(new Blob(['%PDF'], { type: 'application/pdf' }), 'resume.pdf');

    expect(click).toHaveBeenCalledTimes(1);
    expect(document.querySelector('a[download]')).toBeNull();
    vi.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');

    click.mockRestore();
    vi.useRealTimers();
  });
});
