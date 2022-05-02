import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { UrlInputData } from './models';
import { getUrlInputData, inputUrlElement } from './dom';
import { distinctUntilChanged, distinctUntilKeyChanged, map } from 'rxjs/operators';

const urlInputDataSubject: BehaviorSubject<UrlInputData> = new BehaviorSubject<UrlInputData>(getUrlInputData());
export const urlInputChanges: Observable<UrlInputData> = urlInputDataSubject.asObservable();
export const urlInputValidationChanges: Observable<boolean> = urlInputChanges.pipe(
    map((e: UrlInputData): boolean => e.isValidUrl),
    distinctUntilChanged(),
);
fromEvent(inputUrlElement, 'input')
    .pipe(
        map(
            (): UrlInputData => {
                return getUrlInputData();
            },
        ),
    )
    .subscribe((e: UrlInputData): void => urlInputDataSubject.next(e));
