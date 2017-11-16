//
// Copyright (c) 2017, weidian.com
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above copyright notice, this
// list of conditions and the following disclaimer.
//
// * Redistributions in binary form must reproduce the above copyright notice,
// this list of conditions and the following disclaimer in the documentation
// and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//


#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <CoreGraphics/CoreGraphics.h>

@protocol GLProgressHUDDelegate;


typedef NS_ENUM(NSInteger, GLProgressHUDMode) {
	/** Progress is shown using an UIActivityIndicatorView. This is the default. */
	GLProgressHUDModeIndeterminate,
	/** Progress is shown using a round, pie-chart like, progress view. */
	GLProgressHUDModeDeterminate,
	/** Progress is shown using a horizontal progress bar */
	GLProgressHUDModeDeterminateHorizontalBar,
	/** Progress is shown using a ring-shaped progress view. */
	GLProgressHUDModeAnnularDeterminate,
	/** Shows a custom view */
	GLProgressHUDModeCustomView,
	/** Shows only labels */
	GLProgressHUDModeText
};

typedef NS_ENUM(NSInteger, GLProgressHUDAnimation) {
	/** Opacity animation */
	GLProgressHUDAnimationFade,
	/** Opacity + scale animation */
	GLProgressHUDAnimationZoom,
	GLProgressHUDAnimationZoomOut = GLProgressHUDAnimationZoom,
	GLProgressHUDAnimationZoomIn
};


#ifndef GL_INSTANCETYPE
#if __has_feature(objc_instancetype)
	#define GL_INSTANCETYPE instancetype
#else
	#define GL_INSTANCETYPE id
#endif
#endif

#ifndef GL_STRONG
#if __has_feature(objc_arc)
	#define GL_STRONG strong
#else
	#define GL_STRONG retain
#endif
#endif

#ifndef GL_WEAK
#if __has_feature(objc_arc_weak)
	#define GL_WEAK weak
#elif __has_feature(objc_arc)
	#define GL_WEAK unsafe_unretained
#else
	#define GL_WEAK assign
#endif
#endif

#if NS_BLOCKS_AVAILABLE
typedef void (^GLProgressHUDCompletionBlock)();
#endif


/** 
 * Displays a simple HUD window containing a progress indicator and two optional labels for short messages.
 *
 * This is a simple drop-in class for displaying a progress HUD view similar to Apple's private UIProgressHUD class.
 * The GLProgressHUD window spans over the entire space given to it by the initWithFrame constructor and catches all
 * user input on this region, thereby preventing the user operations on components below the view. The HUD itself is
 * drawn centered as a rounded semi-transparent view which resizes depending on the user specified content.
 *
 * This view supports four modes of operation:
 * - GLProgressHUDModeIndeterminate - shows a UIActivityIndicatorView
 * - GLProgressHUDModeDeterminate - shows a custom round progress indicator
 * - GLProgressHUDModeAnnularDeterminate - shows a custom annular progress indicator
 * - GLProgressHUDModeCustomView - shows an arbitrary, user specified view (@see customView)
 *
 * All three modes can have optional labels assigned:
 * - If the labelText property is set and non-empty then a label containing the provided content is placed below the
 *   indicator view.
 * - If also the detailsLabelText property is set then another label is placed below the first label.
 */
@interface GLProgressHUD : UIView

/**
 * Creates a new HUD, adds it to provided view and shows it. The counterpart to this method is hideHUDForView:animated:.
 * 
 * @param view The view that the HUD will be added to
 * @param animated If set to YES the HUD will appear using the current animationType. If set to NO the HUD will not use
 * animations while appearing.
 * @return A reference to the created HUD.
 *
 * @see hideHUDForView:animated:
 * @see animationType
 */
+ (GL_INSTANCETYPE)showHUDAddedTo:(UIView *)view animated:(BOOL)animated;

/**
 * Finds the top-most HUD subview and hides it. The counterpart to this method is showHUDAddedTo:animated:.
 *
 * @param view The view that is going to be searched for a HUD subview.
 * @param animated If set to YES the HUD will disappear using the current animationType. If set to NO the HUD will not use
 * animations while disappearing.
 * @return YES if a HUD was found and removed, NO otherwise. 
 *
 * @see showHUDAddedTo:animated:
 * @see animationType
 */
+ (BOOL)hideHUDForView:(UIView *)view animated:(BOOL)animated;

/**
 * Finds all the HUD subviews and hides them. 
 *
 * @param view The view that is going to be searched for HUD subviews.
 * @param animated If set to YES the HUDs will disappear using the current animationType. If set to NO the HUDs will not use
 * animations while disappearing.
 * @return the nuGLer of HUDs found and removed.
 *
 * @see hideHUDForView:animated:
 * @see animationType
 */
+ (NSUInteger)hideAllHUDsForView:(UIView *)view animated:(BOOL)animated;

/**
 * Finds the top-most HUD subview and returns it. 
 *
 * @param view The view that is going to be searched.
 * @return A reference to the last HUD subview discovered.
 */
+ (GL_INSTANCETYPE)HUDForView:(UIView *)view;

/**
 * Finds all HUD subviews and returns them.
 *
 * @param view The view that is going to be searched.
 * @return All found HUD views (array of GLProgressHUD objects).
 */
+ (NSArray *)allHUDsForView:(UIView *)view;

/**
 * A convenience constructor that initializes the HUD with the window's bounds. Calls the designated constructor with
 * window.bounds as the parameter.
 *
 * @param window The window instance that will provide the bounds for the HUD. Should be the same instance as
 * the HUD's superview (i.e., the window that the HUD will be added to).
 */
- (id)initWithWindow:(UIWindow *)window;

/**
 * A convenience constructor that initializes the HUD with the view's bounds. Calls the designated constructor with
 * view.bounds as the parameter
 *
 * @param view The view instance that will provide the bounds for the HUD. Should be the same instance as
 * the HUD's superview (i.e., the view that the HUD will be added to).
 */
- (id)initWithView:(UIView *)view;

/** 
 * Display the HUD. You need to make sure that the main thread completes its run loop soon after this method call so
 * the user interface can be updated. Call this method when your task is already set-up to be executed in a new thread
 * (e.g., when using something like NSOperation or calling an asynchronous call like NSURLRequest).
 *
 * @param animated If set to YES the HUD will appear using the current animationType. If set to NO the HUD will not use
 * animations while appearing.
 *
 * @see animationType
 */
- (void)show:(BOOL)animated;

/** 
 * Hide the HUD. This still calls the hudWasHidden: delegate. This is the counterpart of the show: method. Use it to
 * hide the HUD when your task completes.
 *
 * @param animated If set to YES the HUD will disappear using the current animationType. If set to NO the HUD will not use
 * animations while disappearing.
 *
 * @see animationType
 */
- (void)hide:(BOOL)animated;

/** 
 * Hide the HUD after a delay. This still calls the hudWasHidden: delegate. This is the counterpart of the show: method. Use it to
 * hide the HUD when your task completes.
 *
 * @param animated If set to YES the HUD will disappear using the current animationType. If set to NO the HUD will not use
 * animations while disappearing.
 * @param delay Delay in seconds until the HUD is hidden.
 *
 * @see animationType
 */
- (void)hide:(BOOL)animated afterDelay:(NSTimeInterval)delay;

/** 
 * Shows the HUD while a background task is executing in a new thread, then hides the HUD.
 *
 * This method also takes care of autorelease pools so your method does not have to be concerned with setting up a
 * pool.
 *
 * @param method The method to be executed while the HUD is shown. This method will be executed in a new thread.
 * @param target The object that the target method belongs to.
 * @param object An optional object to be passed to the method.
 * @param animated If set to YES the HUD will (dis)appear using the current animationType. If set to NO the HUD will not use
 * animations while (dis)appearing.
 */
- (void)showWhileExecuting:(SEL)method onTarget:(id)target withObject:(id)object animated:(BOOL)animated;

#if NS_BLOCKS_AVAILABLE

/**
 * Shows the HUD while a block is executing on a background queue, then hides the HUD.
 *
 * @see showAnimated:whileExecutingBlock:onQueue:completionBlock:
 */
- (void)showAnimated:(BOOL)animated whileExecutingBlock:(dispatch_block_t)block;

/**
 * Shows the HUD while a block is executing on a background queue, then hides the HUD.
 *
 * @see showAnimated:whileExecutingBlock:onQueue:completionBlock:
 */
- (void)showAnimated:(BOOL)animated whileExecutingBlock:(dispatch_block_t)block completionBlock:(GLProgressHUDCompletionBlock)completion;

/**
 * Shows the HUD while a block is executing on the specified dispatch queue, then hides the HUD.
 *
 * @see showAnimated:whileExecutingBlock:onQueue:completionBlock:
 */
- (void)showAnimated:(BOOL)animated whileExecutingBlock:(dispatch_block_t)block onQueue:(dispatch_queue_t)queue;

/** 
 * Shows the HUD while a block is executing on the specified dispatch queue, executes completion block on the main queue, and then hides the HUD.
 *
 * @param animated If set to YES the HUD will (dis)appear using the current animationType. If set to NO the HUD will
 * not use animations while (dis)appearing.
 * @param block The block to be executed while the HUD is shown.
 * @param queue The dispatch queue on which the block should be executed.
 * @param completion The block to be executed on completion.
 *
 * @see completionBlock
 */
- (void)showAnimated:(BOOL)animated whileExecutingBlock:(dispatch_block_t)block onQueue:(dispatch_queue_t)queue
		  completionBlock:(GLProgressHUDCompletionBlock)completion;

/**
 * A block that gets called after the HUD was completely hidden.
 */
@property (copy) GLProgressHUDCompletionBlock completionBlock;

#endif

/** 
 * GLProgressHUD operation mode. The default is GLProgressHUDModeIndeterminate.
 *
 * @see GLProgressHUDMode
 */
@property (assign) GLProgressHUDMode mode;

/**
 * The animation type that should be used when the HUD is shown and hidden. 
 *
 * @see GLProgressHUDAnimation
 */
@property (assign) GLProgressHUDAnimation animationType;

/**
 * The UIView (e.g., a UIImageView) to be shown when the HUD is in GLProgressHUDModeCustomView.
 * For best results use a 37 by 37 pixel view (so the bounds match the built in indicator bounds). 
 */
@property (GL_STRONG) UIView *customView;

/** 
 * The HUD delegate object. 
 *
 * @see GLProgressHUDDelegate
 */
@property (GL_WEAK) id<GLProgressHUDDelegate> delegate;

/** 
 * An optional short message to be displayed below the activity indicator. The HUD is automatically resized to fit
 * the entire text. If the text is too long it will get clipped by displaying "..." at the end. If left unchanged or
 * set to @"", then no message is displayed.
 */
@property (copy) NSString *labelText;

/** 
 * An optional details message displayed below the labelText message. This message is displayed only if the labelText
 * property is also set and is different from an empty string (@""). The details text can span multiple lines. 
 */
@property (copy) NSString *detailsLabelText;

/** 
 * The opacity of the HUD window. Defaults to 0.8 (80% opacity). 
 */
@property (assign) float opacity;

/**
 * The color of the HUD window. Defaults to black. If this property is set, color is set using
 * this UIColor and the opacity property is not used.  using retain because performing copy on
 * UIColor base colors (like [UIColor greenColor]) cause problems with the copyZone.
 */
@property (GL_STRONG) UIColor *color;

/** 
 * The x-axis offset of the HUD relative to the centre of the superview. 
 */
@property (assign) float xOffset;

/** 
 * The y-axis offset of the HUD relative to the centre of the superview. 
 */
@property (assign) float yOffset;

/**
 * The amount of space between the HUD edge and the HUD elements (labels, indicators or custom views). 
 * Defaults to 20.0
 */
@property (assign) float margin;

/**
 * The corner radius for the HUD
 * Defaults to 10.0
 */
@property (assign) float cornerRadius;

/** 
 * Cover the HUD background view with a radial gradient. 
 */
@property (assign) BOOL diGLackground;

/*
 * Grace period is the time (in seconds) that the invoked method may be run without 
 * showing the HUD. If the task finishes before the grace time runs out, the HUD will
 * not be shown at all. 
 * This may be used to prevent HUD display for very short tasks.
 * Defaults to 0 (no grace time).
 * Grace time functionality is only supported when the task status is known!
 * @see taskInProgress
 */
@property (assign) float graceTime;

/**
 * The minimum time (in seconds) that the HUD is shown. 
 * This avoids the problem of the HUD being shown and than instantly hidden.
 * Defaults to 0 (no minimum show time).
 */
@property (assign) float minShowTime;

/**
 * Indicates that the executed operation is in progress. Needed for correct graceTime operation.
 * If you don't set a graceTime (different than 0.0) this does nothing.
 * This property is automatically set when using showWhileExecuting:onTarget:withObject:animated:.
 * When threading is done outside of the HUD (i.e., when the show: and hide: methods are used directly),
 * you need to set this property when your task starts and completes in order to have normal graceTime 
 * functionality.
 */
@property (assign) BOOL taskInProgress;

/**
 * Removes the HUD from its parent view when hidden. 
 * Defaults to NO. 
 */
@property (assign) BOOL removeFromSuperViewOnHide;

/** 
 * Font to be used for the main label. Set this property if the default is not adequate. 
 */
@property (GL_STRONG) UIFont* labelFont;

/**
 * Color to be used for the main label. Set this property if the default is not adequate.
 */
@property (GL_STRONG) UIColor* labelColor;

/**
 * Font to be used for the details label. Set this property if the default is not adequate.
 */
@property (GL_STRONG) UIFont* detailsLabelFont;

/** 
 * Color to be used for the details label. Set this property if the default is not adequate.
 */
@property (GL_STRONG) UIColor* detailsLabelColor;

/**
 * The color of the activity indicator. Defaults to [UIColor whiteColor]
 * Does nothing on pre iOS 5.
 */
@property (GL_STRONG) UIColor *activityIndicatorColor;

/** 
 * The progress of the progress indicator, from 0.0 to 1.0. Defaults to 0.0. 
 */
@property (assign) float progress;

/**
 * The minimum size of the HUD bezel. Defaults to CGSizeZero (no minimum size).
 */
@property (assign) CGSize minSize;


/**
 * The actual size of the HUD bezel.
 * You can use this to limit touch handling on the bezel aria only.
 * @see https://github.com/jdg/GLProgressHUD/pull/200
 */
@property (atomic, assign, readonly) CGSize size;


/**
 * Force the HUD dimensions to be equal if possible. 
 */
@property (assign, getter = isSquare) BOOL square;

@end


@protocol GLProgressHUDDelegate <NSObject>

@optional

/** 
 * Called after the HUD was fully hidden from the screen. 
 */
- (void)hudWasHidden:(GLProgressHUD *)hud;

@end


/**
 * A progress view for showing definite progress by filling up a circle (pie chart).
 */
@interface GLRoundProgressView : UIView 

/**
 * Progress (0.0 to 1.0)
 */
@property (nonatomic, assign) float progress;

/**
 * Indicator progress color.
 * Defaults to white [UIColor whiteColor]
 */
@property (nonatomic, GL_STRONG) UIColor *progressTintColor;

/**
 * Indicator background (non-progress) color.
 * Defaults to translucent white (alpha 0.1)
 */
@property (nonatomic, GL_STRONG) UIColor *backgroundTintColor;

/*
 * Display mode - NO = round or YES = annular. Defaults to round.
 */
@property (nonatomic, assign, getter = isAnnular) BOOL annular;

@end


/**
 * A flat bar progress view. 
 */
@interface GLBarProgressView : UIView

/**
 * Progress (0.0 to 1.0)
 */
@property (nonatomic, assign) float progress;

/**
 * Bar border line color.
 * Defaults to white [UIColor whiteColor].
 */
@property (nonatomic, GL_STRONG) UIColor *lineColor;

/**
 * Bar background color.
 * Defaults to clear [UIColor clearColor];
 */
@property (nonatomic, GL_STRONG) UIColor *progressRemainingColor;

/**
 * Bar progress color.
 * Defaults to white [UIColor whiteColor].
 */
@property (nonatomic, GL_STRONG) UIColor *progressColor;

@end

