import 'reflect-metadata';
import { RESPONSE_MESSAGE_KEY, ResponseMessage } from './response-message.decorator';
import { SKIP_TRANSFORM_KEY, SkipTransform } from './skip-transform.decorator';

describe('decorators', () => {
  it('ResponseMessage should attach metadata to a method', () => {
    class TestController {
      @ResponseMessage('created')
      create() {}
    }

    const metadata = Reflect.getMetadata(RESPONSE_MESSAGE_KEY, TestController.prototype.create);

    expect(metadata).toBe('created');
  });

  it('SkipTransform should attach metadata to a method', () => {
    class TestController {
      @SkipTransform()
      health() {}
    }

    const metadata = Reflect.getMetadata(SKIP_TRANSFORM_KEY, TestController.prototype.health);

    expect(metadata).toBe(true);
  });
});
