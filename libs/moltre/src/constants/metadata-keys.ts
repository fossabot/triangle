export class MetadataKeys {

// Used for named bindings
  public static NAMED_TAG = 'named';

// The name of the target at design time
  public static NAME_TAG = 'name';

// The for unmanaged injections (in base classes when using inheritance)
  public static UNMANAGED_TAG = 'unmanaged';

// The for optional injections
  public static OPTIONAL_TAG = 'optional';

// The type of the binding at design time
  public static INJECT_TAG = 'inject';

// The type of the binding at design type for multi-injections
  public static MULTI_INJECT_TAG = 'multi_inject';

// used to store constructor arguments tags
  public static TAGGED = 'moltre:tagged';

// used to store class properties tags
  public static TAGGED_PROP = 'moltre:tagged_props';

// used to store types to be injected
  public static PARAM_TYPES = 'moltre:paramtypes';

// used to access design time types
  public static DESIGN_PARAM_TYPES = 'design:paramtypes';

// used to identify postConstruct functions
  public static POST_CONSTRUCT = 'post_construct';
}